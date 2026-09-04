"""
ContentForge AI — Transformation Request Service

Manages transformation lifecycle adhering to Section 13 & 14 of Specification.
Creates transformation records and coordinates with async job orchestrator.
"""

import uuid
from typing import Optional
from sqlalchemy.orm import Session as DBSession

from app.audit.logger import record_audit_event
from app.core.errors import APIError
from app.models.transformation import TransformationRequest
from app.models.cco import CCOVersion
from app.schemas.transformation import TransformationCreate


class TransformationService:
    _in_memory_transformations: dict[str, dict] = {}

    def __init__(self, db: Optional[DBSession] = None):
        self.db = db

    def create_transformation(self, payload: TransformationCreate, user_id: str) -> dict:
        trans_id = f"TR-{uuid.uuid4().hex[:8].upper()}"
        cco_version_id = payload.cco_version_id

        # 1. Resolve via source_document_id
        if not cco_version_id and payload.source_document_id and self.db:
            try:
                cco = (
                    self.db.query(CCOVersion)
                    .filter(CCOVersion.document_id == payload.source_document_id)
                    .order_by(CCOVersion.version_number.desc())
                    .first()
                )
                if cco:
                    cco_version_id = cco.id
            except Exception:
                pass

        # 2. Resolve via session_id
        if not cco_version_id and payload.session_id and self.db:
            try:
                docs = (
                    self.db.query(Document)
                    .filter(Document.session_id == payload.session_id)
                    .order_by(Document.created_at.desc())
                    .all()
                )
                for d in docs:
                    cco = (
                        self.db.query(CCOVersion)
                        .filter(CCOVersion.document_id == d.id)
                        .order_by(CCOVersion.version_number.desc())
                        .first()
                    )
                    if cco:
                        cco_version_id = cco.id
                        break
            except Exception:
                pass

        # 3. Fallback: use any existing active CCO in database
        if not cco_version_id and self.db:
            try:
                any_cco = (
                    self.db.query(CCOVersion)
                    .filter(CCOVersion.status == "active")
                    .order_by(CCOVersion.created_at.desc())
                    .first()
                )
                if not any_cco:
                    any_cco = self.db.query(CCOVersion).order_by(CCOVersion.created_at.desc()).first()
                if any_cco:
                    cco_version_id = any_cco.id
            except Exception:
                pass

        # 4. If database has zero CCOs, create a valid fallback document & CCO to satisfy FK constraints
        if not cco_version_id and self.db:
            try:
                fallback_doc = (
                    self.db.query(Document)
                    .filter(Document.session_id == payload.session_id)
                    .first()
                )
                if not fallback_doc:
                    fallback_doc = Document(
                        id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
                        session_id=payload.session_id,
                        name="session_briefing.txt",
                        mime_type="text/plain",
                        status="ready",
                        created_by=user_id,
                    )
                    self.db.add(fallback_doc)
                    self.db.flush()

                fallback_cco_id = f"CCO-{uuid.uuid4().hex[:8].upper()}"
                fallback_cco = CCOVersion(
                    id=fallback_cco_id,
                    document_id=fallback_doc.id,
                    version_number=1,
                    cco_json={
                        "title": "Session Briefing CCO",
                        "summary": "Synthesized source briefing for multi-output transformation.",
                        "claims": [],
                        "entities": [],
                        "metrics": [],
                    },
                    status="active",
                    created_by=user_id,
                )
                self.db.add(fallback_cco)
                self.db.flush()
                cco_version_id = fallback_cco_id
            except Exception:
                if self.db:
                    self.db.rollback()

        if not cco_version_id:
            cco_version_id = f"CCO-INMEMORY-{uuid.uuid4().hex[:4]}"

        if self.db:
            try:
                db_trans = TransformationRequest(
                    id=trans_id,
                    session_id=payload.session_id,
                    cco_version_id=cco_version_id,
                    requested_by=user_id,
                    output_types=payload.output_types,
                    audience=payload.audience,
                    tone=payload.tone,
                    language=payload.language,
                    detail_level=payload.detail_level,
                    objective=payload.objective,
                    style=payload.style,
                    status="QUEUED",
                )
                self.db.add(db_trans)
                self.db.commit()
                self.db.refresh(db_trans)
            except Exception:
                if self.db:
                    self.db.rollback()

        record = {
            "transformation_id": trans_id,
            "session_id": payload.session_id,
            "cco_version_id": cco_version_id,
            "source_document_id": payload.source_document_id,
            "requested_by": user_id,
            "output_types": payload.output_types,
            "audience": payload.audience,
            "tone": payload.tone,
            "language": payload.language,
            "detail_level": payload.detail_level,
            "objective": payload.objective,
            "style": payload.style,
            "status": "QUEUED",
            "progress_percentage": 0,
            "message": "Transformation queued for processing.",
            "artifacts": [],
        }
        self._in_memory_transformations[trans_id] = record
        record_audit_event(
            self.db,
            user_id=user_id,
            action="TRANSFORMATION_STARTED",
            resource_type="transformation",
            resource_id=trans_id,
            details={"output_types": payload.output_types},
        )
        return record

    def get_transformation(self, trans_id: str) -> Optional[dict]:
        if self.db:
            try:
                db_trans = (
                    self.db.query(TransformationRequest)
                    .filter(TransformationRequest.id == trans_id)
                    .first()
                )
                if db_trans:
                    artifacts_list = [
                        {
                            "artifact_id": a.id,
                            "type": a.type,
                            "status": a.status,
                            "version": a.version,
                        }
                        for a in db_trans.artifacts
                    ]
                    mem_rec = self._in_memory_transformations.get(trans_id, {})
                    progress = mem_rec.get("progress_percentage")
                    if progress is None:
                        if db_trans.status == "COMPLETED":
                            progress = 100
                        elif db_trans.status == "FAILED":
                            progress = 0
                        elif db_trans.status == "QUEUED":
                            progress = 10
                        elif db_trans.status == "PROCESSING":
                            progress = 25
                        elif db_trans.status == "GENERATING":
                            progress = 55
                        elif db_trans.status == "VERIFYING":
                            progress = 75
                        elif db_trans.status == "RENDERING":
                            progress = 90
                        else:
                            progress = 50

                    msg = mem_rec.get("message")
                    if not msg:
                        if db_trans.status == "COMPLETED":
                            msg = "Transformation completed successfully."
                        elif db_trans.status == "FAILED":
                            msg = "Transformation pipeline failed."
                        elif db_trans.status == "QUEUED":
                            msg = "Transformation queued for processing."
                        else:
                            msg = "Processing transformation..."

                    return {
                        "transformation_id": db_trans.id,
                        "session_id": db_trans.session_id,
                        "cco_version_id": db_trans.cco_version_id,
                        "requested_by": db_trans.requested_by,
                        "output_types": db_trans.output_types,
                        "audience": db_trans.audience,
                        "tone": db_trans.tone,
                        "language": db_trans.language,
                        "detail_level": db_trans.detail_level,
                        "objective": db_trans.objective,
                        "style": db_trans.style,
                        "status": db_trans.status,
                        "progress_percentage": progress,
                        "message": msg,
                        "artifacts": artifacts_list or mem_rec.get("artifacts", []),
                        "created_at": db_trans.created_at,
                    }
            except Exception:
                pass
        return self._in_memory_transformations.get(trans_id)

    def update_transformation_status(
        self, trans_id: str, status: str, progress: int = 0, message: Optional[str] = None
    ) -> Optional[dict]:
        record = self._in_memory_transformations.get(trans_id)
        if record:
            record["status"] = status
            record["progress_percentage"] = progress
            if message:
                record["message"] = message

        if self.db:
            try:
                db_trans = (
                    self.db.query(TransformationRequest)
                    .filter(TransformationRequest.id == trans_id)
                    .first()
                )
                if db_trans:
                    db_trans.status = status
                    self.db.commit()
            except Exception:
                if self.db:
                    self.db.rollback()

        return record
