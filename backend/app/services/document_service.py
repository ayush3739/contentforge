"""
ContentForge AI — Document & CCO Persistence Service

Handles file ingestion, Object Storage storage key generation, SHA-256 calculation,
and CCO metadata creation adhering to Section 8 of Specification.
"""

import hashlib
import logging
import uuid
from typing import BinaryIO, Optional
from sqlalchemy.orm import Session as DBSession

from app.audit.logger import record_audit_event, record_security_event
from app.core.errors import APIError
from app.jobs.worker import dispatch_ingestion_job
from app.models.cco import CCOVersion
from app.models.document import Document
from app.storage import get_storage_provider

logger = logging.getLogger("app.services.document")

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/markdown",
    "application/octet-stream",
}

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt", ".md"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB limit


class DocumentService:
    _in_memory_docs: dict[str, dict] = {}
    _in_memory_ccos: dict[str, dict] = {}

    def __init__(self, db: Optional[DBSession] = None):
        self.db = db
        self.storage = get_storage_provider()

    def _validate_file(self, filename: str, content: bytes, mime_type: str):
        if not content or len(content) == 0:
            raise APIError("EMPTY_FILE", "Uploaded document file is empty.", status_code=400)

        if len(content) > MAX_FILE_SIZE_BYTES:
            record_security_event(self.db, "FILE_SIZE_EXCEEDED", severity="medium", details={"filename": filename, "size": len(content)})
            raise APIError("FILE_TOO_LARGE", f"Uploaded file exceeds maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.", status_code=400)

        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in SUPPORTED_EXTENSIONS and mime_type not in ALLOWED_MIME_TYPES:
            record_security_event(self.db, "UNSUPPORTED_FILE_TYPE", severity="low", details={"filename": filename, "mime_type": mime_type})
            raise APIError("UNSUPPORTED_FILE_TYPE", f"File type '{ext or mime_type}' is not supported. Allowed formats: PDF, DOCX, PPTX, TXT, MD.", status_code=400)

    def assert_owner(self, doc_id: str, user_id: str, role: Optional[str] = None):
        if not self.db:
            doc = self._in_memory_docs.get(doc_id)
            if not doc:
                raise APIError("DOCUMENT_NOT_FOUND", f"Document with ID '{doc_id}' does not exist.", status_code=404)
            if role == "admin":
                return doc
            is_owner = (doc.get("created_by") == user_id)
            if not is_owner and doc.get("session_id"):
                from app.services.session_service import SessionService
                sess = SessionService._in_memory_sessions.get(doc["session_id"])
                if sess and sess.get("created_by") == user_id:
                    is_owner = True
            if not is_owner:
                raise APIError("FORBIDDEN", "You do not have permission to access this document.", status_code=403)
            return doc

        db_doc = self.db.query(Document).filter(Document.id == doc_id).first()
        if not db_doc:
            raise APIError("DOCUMENT_NOT_FOUND", f"Document with ID '{doc_id}' does not exist.", status_code=404)
        if role == "admin":
            return db_doc
        is_owner = (db_doc.created_by == user_id)
        if not is_owner and db_doc.session_id:
            from app.models.session import Session as WorkspaceSession
            sess = self.db.query(WorkspaceSession).filter(WorkspaceSession.id == db_doc.session_id).first()
            if sess and sess.created_by == user_id:
                is_owner = True
        if not is_owner:
            raise APIError("FORBIDDEN", "You do not have permission to access this document.", status_code=403)
        return db_doc

    async def upload_document(
        self,
        session_id: str,
        filename: str,
        content: bytes,
        mime_type: str,
        user_id: str,
        role: Optional[str] = None,
    ) -> dict:
        self._validate_file(filename, content, mime_type)

        if session_id:
            if self.db:
                from app.models.session import Session as WorkspaceSession
                sess = self.db.query(WorkspaceSession).filter(WorkspaceSession.id == session_id).first()
                if sess and sess.created_by and sess.created_by != user_id and role != "admin":
                    raise APIError("FORBIDDEN", "You do not have permission to upload documents to this session workspace.", status_code=403)
            else:
                from app.services.session_service import SessionService
                sess = SessionService._in_memory_sessions.get(session_id)
                if sess and sess.get("created_by") and sess.get("created_by") != user_id and role != "admin":
                    raise APIError("FORBIDDEN", "You do not have permission to upload documents to this session workspace.", status_code=403)

        checksum = hashlib.sha256(content).hexdigest()
        doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        storage_key = f"documents/{session_id}/{doc_id}/{filename}"

        await self.storage.put_object(storage_key, content, content_type=mime_type)

        if self.db:
            try:
                db_doc = Document(
                    id=doc_id,
                    session_id=session_id,
                    name=filename,
                    mime_type=mime_type,
                    version=1,
                    checksum=checksum,
                    storage_key=storage_key,
                    status="UPLOADED",
                    created_by=user_id,
                )
                self.db.add(db_doc)
                self.db.commit()
                
                # Dispatch AI pipeline ingestion job (job creates its own DB session)
                dispatch_ingestion_job(
                    document_id=doc_id,
                    session_id=session_id,
                    storage_key=storage_key,
                    filename=filename,
                    mime_type=mime_type,
                )
            except Exception:
                if self.db:
                    self.db.rollback()

        doc_data = {
            "id": doc_id,
            "session_id": session_id,
            "name": filename,
            "mime_type": mime_type,
            "version": 1,
            "checksum": checksum,
            "storage_key": storage_key,
            "status": "UPLOADED",
            "created_by": user_id,
        }
        self._in_memory_docs[doc_id] = doc_data
        record_audit_event(self.db, user_id=user_id, action="UPLOAD", resource_type="document", resource_id=doc_id)
        return doc_data

    async def upload_document_stream(
        self,
        session_id: str,
        filename: str,
        content: bytes,
        mime_type: str,
        user_id: str,
        role: Optional[str] = None,
    ):
        import json
        from fastapi.responses import StreamingResponse
        from app.jobs.orchestrator import IngestionJobOrchestrator

        self._validate_file(filename, content, mime_type)

        if self.db and session_id:
            from app.models.session import Session as WorkspaceSession
            sess = self.db.query(WorkspaceSession).filter(WorkspaceSession.id == session_id).first()
            if sess and sess.created_by and sess.created_by != user_id and role != "admin":
                raise APIError("FORBIDDEN", "You do not have permission to upload documents to this session workspace.", status_code=403)

        checksum = hashlib.sha256(content).hexdigest()
        doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        storage_key = f"documents/{session_id}/{doc_id}/{filename}"

        await self.storage.put_object(storage_key, content, content_type=mime_type)

        if self.db:
            try:
                db_doc = Document(
                    id=doc_id,
                    session_id=session_id,
                    name=filename,
                    mime_type=mime_type,
                    version=1,
                    checksum=checksum,
                    storage_key=storage_key,
                    status="UPLOADED",
                    created_by=user_id,
                )
                self.db.add(db_doc)
                self.db.commit()
            except Exception:
                self.db.rollback()

        doc_data = {
            "id": doc_id,
            "session_id": session_id,
            "name": filename,
            "mime_type": mime_type,
            "version": 1,
            "checksum": checksum,
            "storage_key": storage_key,
            "status": "UPLOADED",
            "created_by": user_id,
        }
        self._in_memory_docs[doc_id] = doc_data

        record_audit_event(self.db, user_id=user_id, action="UPLOAD", resource_type="document", resource_id=doc_id)

        async def sse_event_publisher():
            orchestrator = IngestionJobOrchestrator(db=self.db)
            try:
                async for item in orchestrator.stream_process(
                    document_id=doc_id,
                    session_id=session_id,
                    storage_key=storage_key,
                    filename=filename,
                    mime_type=mime_type,
                ):
                    event_name = item.get("event", "message")
                    data_json = json.dumps(item.get("data", {}))
                    yield f"event: {event_name}\ndata: {data_json}\n\n"
            except Exception as exc:
                err_json = json.dumps({"message": str(exc), "stage": "failed"})
                yield f"event: error\ndata: {err_json}\n\n"

        return StreamingResponse(
            sse_event_publisher(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    def get_document(self, doc_id: str) -> Optional[dict]:
        if self.db:
            try:
                db_doc = self.db.query(Document).filter(Document.id == doc_id).first()
                if db_doc:
                    return {
                        "id": db_doc.id,
                        "session_id": db_doc.session_id,
                        "name": db_doc.name,
                        "mime_type": db_doc.mime_type,
                        "version": db_doc.version,
                        "checksum": db_doc.checksum,
                        "storage_key": db_doc.storage_key,
                        "status": db_doc.status,
                        "created_by": db_doc.created_by,
                        "created_at": db_doc.created_at,
                    }
            except Exception:
                pass
        return self._in_memory_docs.get(doc_id)

    async def get_document_binary(self, doc_id: str) -> Optional[bytes]:
        doc = self.get_document(doc_id)
        if not doc or not doc.get("storage_key"):
            return None
        return await self.storage.get_object(doc["storage_key"])

    def get_document_cco(self, doc_id: str) -> Optional[dict]:
        if self.db:
            try:
                cco = (
                    self.db.query(CCOVersion)
                    .filter(CCOVersion.document_id == doc_id)
                    .order_by(CCOVersion.version_number.desc())
                    .first()
                )
                if cco:
                    content_hash = (
                        cco.cco_json.get("metadata", {}).get("content_hash")
                        if isinstance(cco.cco_json, dict)
                        else None
                    )
                    if not content_hash and cco.document:
                        content_hash = cco.document.checksum
                    return {
                        "document_id": doc_id,
                        "cco_version_id": cco.id,
                        "version": cco.version_number,
                        "hash": content_hash or "hash_unavailable",
                        "cco_json": cco.cco_json,
                    }
            except Exception as e:
                logger.error(f"[CCO] Failed to retrieve CCO for document {doc_id}: {e}")
        doc = self.get_document(doc_id)
        if doc:
            return {
                "document_id": doc_id,
                "cco_version_id": f"CCO-{doc_id}",
                "version": 1,
                "hash": doc.get("checksum", "mock_hash")[:32],
                "cco_json": {"title": doc["name"], "overview": "Extracted document content"},
            }
        return None

    def get_document_evidence(self, doc_id: str) -> dict:
        if self.db:
            try:
                from app.models.chunk import Chunk, SourceBlock
                db_chunks = self.db.query(Chunk).filter(Chunk.document_id == doc_id).order_by(Chunk.chunk_index.asc()).all()
                db_blocks = self.db.query(SourceBlock).filter(SourceBlock.document_id == doc_id).order_by(SourceBlock.position.asc()).all()
                if db_chunks or db_blocks:
                    return {
                        "document_id": doc_id,
                        "chunk_count": len(db_chunks) if db_chunks else len(db_blocks),
                        "chunks": [
                            {
                                "chunk_id": c.id,
                                "text": c.text,
                                "section": c.section or "General",
                                "page": c.page or 1,
                            }
                            for c in db_chunks
                        ] if db_chunks else [
                            {
                                "chunk_id": b.id,
                                "text": b.text,
                                "section": b.metadata_json.get("section", "General") if b.metadata_json else "General",
                                "page": b.page or 1,
                            }
                            for b in db_blocks
                        ],
                        "source_blocks": [
                            {
                                "id": b.id,
                                "block_type": b.block_type,
                                "text": b.text,
                                "page": b.page,
                                "position": b.position,
                            }
                            for b in db_blocks
                        ],
                    }
            except Exception as e:
                logger.warning(f"Failed to query evidence for document {doc_id}: {e}")

        doc = self.get_document(doc_id)
        return {
            "document_id": doc_id,
            "chunk_count": 1,
            "chunks": [
                {
                    "chunk_id": f"chunk-{doc_id}-001",
                    "text": f"Extracted text content from source document {doc.get('name', 'file') if doc else doc_id}.",
                    "section": "General",
                    "page": 1,
                }
            ],
            "source_blocks": [],
        }
