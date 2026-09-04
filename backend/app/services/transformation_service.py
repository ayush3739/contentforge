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

        if not cco_version_id and payload.source_document_id:
            if self.db:
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
            if not cco_version_id:
                cco_version_id = f"CCO-{payload.source_document_id}"

        if not cco_version_id:
            cco_version_id = f"CCO-DEFAULT-{uuid.uuid4().hex[:4]}"

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
                        "progress_percentage": 100 if db_trans.status == "COMPLETED" else 50,
                        "artifacts": artifacts_list,
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
