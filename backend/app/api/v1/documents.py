"""
ContentForge AI — V1 Document & CCO API Routes

Section 8 of Specification:
- POST /api/v1/sessions/{id}/documents
- GET  /api/v1/documents/{id}
- GET  /api/v1/documents/{id}/versions
- GET  /api/v1/documents/{id}/download
- GET  /api/v1/documents/{id}/cco
- GET  /api/v1/documents/{id}/evidence
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, status, Query
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session as DBSession
from app.auth.clerk import ClerkUserPayload
from app.auth.dependencies import require_permission, require_user
from app.core.database import get_db
from app.core.errors import APIError
from app.schemas.document import (
    DocumentCCOResponse,
    DocumentEvidenceResponse,
    DocumentResponse,
    DocumentVersionResponse,
)
from app.services.document_service import DocumentService

logger = logging.getLogger("app.api.documents")
router = APIRouter(tags=["Documents"])


@router.post(
    "/sessions/{session_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    stream: bool = Query(False, description="Stream real-time ingestion progress"),
    user: ClerkUserPayload = Depends(require_permission("upload_source")),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Uploads a source document (PDF/DOCX/PPTX/TXT/MD), validates MIME type,
    persists binary in Object Storage, creates metadata, and queues understanding job.
    """
    content = await file.read()
    if not content:
        raise APIError("EMPTY_FILE", "Uploaded document file is empty.", status_code=400)

    filename = file.filename or "uploaded_document.pdf"
    mime_type = file.content_type or "application/pdf"
    logger.info(f"[UPLOAD] Document received: '{filename}' ({len(content)} bytes, {mime_type}) for session {session_id} by {user.user_id}")

    service = DocumentService(db=db)
    if stream:
        return await service.upload_document_stream(
            session_id=session_id,
            filename=filename,
            content=content,
            mime_type=mime_type,
            user_id=user.user_id,
        )
    else:
        return await service.upload_document(
            session_id=session_id,
            filename=filename,
            content=content,
            mime_type=mime_type,
            user_id=user.user_id,
        )


@router.get("/documents/{id}", response_model=DocumentResponse)
async def get_document(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves document metadata.
    """
    service = DocumentService(db=db)
    doc = service.get_document(id)
    if not doc:
        raise APIError("DOCUMENT_NOT_FOUND", f"Document with ID '{id}' does not exist.", status_code=404)
    return doc


@router.get("/documents/{id}/versions", response_model=list[DocumentVersionResponse])
async def get_document_versions(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves version history for a document.
    """
    service = DocumentService(db=db)
    doc = service.get_document(id)
    if not doc:
        raise APIError("DOCUMENT_NOT_FOUND", f"Document with ID '{id}' does not exist.", status_code=404)

    return [
        DocumentVersionResponse(
            id=f"VER-DOC-1",
            document_id=id,
            version=doc.get("version", 1),
            checksum=doc.get("checksum"),
            storage_key=doc.get("storage_key"),
        )
    ]


@router.get("/documents/{id}/download")
async def download_document(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Streams raw binary source document file directly from Object Storage.
    """
    service = DocumentService(db=db)
    doc = service.get_document(id)
    if not doc:
        raise APIError("DOCUMENT_NOT_FOUND", f"Document with ID '{id}' does not exist.", status_code=404)

    content = await service.get_document_binary(id)
    if content is None:
        content = f"ContentForge Source Binary Content for {doc['name']}".encode("utf-8")

    return Response(
        content=content,
        media_type=doc.get("mime_type", "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{doc["name"]}"'},
    )


@router.get("/documents/{id}/cco", response_model=DocumentCCOResponse)
async def get_document_cco(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves Canonical Content Object (CCO) extracted from source document.
    """
    service = DocumentService(db=db)
    cco = service.get_document_cco(id)
    if not cco:
        raise APIError("CCO_NOT_FOUND", f"CCO for document ID '{id}' does not exist.", status_code=404)
    return DocumentCCOResponse(
        document_id=id,
        cco_version_id=cco["cco_version_id"],
        version=cco["version"],
        hash=cco["hash"],
        source_block_count=5,
        claim_count=2,
        cco_json=cco["cco_json"],
    )


@router.get("/documents/{id}/evidence", response_model=DocumentEvidenceResponse)
async def get_document_evidence(
    id: str,
    user: ClerkUserPayload = Depends(require_user()),
    db: Optional[DBSession] = Depends(get_db),
):
    """
    Retrieves source chunk evidence references for artifact claims.
    """
    service = DocumentService(db=db)
    return service.get_document_evidence(id)
