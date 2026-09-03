"""
ContentForge AI — Workspace Session Service
"""

import uuid
from typing import Optional
from sqlalchemy.orm import Session as DBSession
from app.audit.logger import record_audit_event
from app.models.session import Session
from app.models.document import Document
from app.models.transformation import TransformationRequest
from app.schemas.session import SessionCreate, SessionUpdate


class SessionService:
    _in_memory_sessions: dict[str, dict] = {}

    def __init__(self, db: Optional[DBSession] = None):
        self.db = db

    def create_session(self, payload: SessionCreate, user_id: str) -> dict:
        session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
        if self.db:
            try:
                db_session = Session(
                    id=session_id,
                    name=payload.name,
                    created_by=user_id,
                    status="active",
                )
                self.db.add(db_session)
                self.db.commit()
                self.db.refresh(db_session)
            except Exception:
                if self.db:
                    self.db.rollback()

        sess_data = {
            "id": session_id,
            "name": payload.name,
            "created_by": user_id,
            "status": "active",
            "document_count": 0,
            "transformation_count": 0,
        }
        self._in_memory_sessions[session_id] = sess_data
        record_audit_event(self.db, user_id=user_id, action="SESSION_CREATED", resource_type="session", resource_id=session_id)
        return sess_data

    def get_session(self, session_id: str) -> Optional[dict]:
        if self.db:
            try:
                db_session = self.db.query(Session).filter(Session.id == session_id).first()
                if db_session:
                    doc_count = self.db.query(Document).filter(Document.session_id == session_id).count()
                    trans_count = self.db.query(TransformationRequest).filter(TransformationRequest.session_id == session_id).count()
                    return {
                        "id": db_session.id,
                        "name": db_session.name,
                        "created_by": db_session.created_by,
                        "status": db_session.status,
                        "document_count": doc_count,
                        "transformation_count": trans_count,
                        "created_at": db_session.created_at,
                        "updated_at": db_session.updated_at,
                    }
            except Exception:
                pass
        return self._in_memory_sessions.get(session_id)

    def list_sessions(self, user_id: Optional[str] = None) -> list[dict]:
        if self.db:
            try:
                query = self.db.query(Session)
                if user_id:
                    query = query.filter(Session.created_by == user_id)
                sessions = query.all()
                if sessions:
                    return [
                        {
                            "id": s.id,
                            "name": s.name,
                            "created_by": s.created_by,
                            "status": s.status,
                            "document_count": len(s.documents),
                            "transformation_count": len(s.transformation_requests),
                            "created_at": s.created_at,
                        }
                        for s in sessions
                    ]
            except Exception:
                pass
        
        # In-memory fallback
        items = list(self._in_memory_sessions.values())
        if user_id:
            return [s for s in items if s.get("created_by") == user_id]
        return items

    def update_session(self, session_id: str, payload: SessionUpdate, user_id: str) -> Optional[dict]:
        sess = self.get_session(session_id)
        if not sess:
            return None
        if payload.name:
            sess["name"] = payload.name
        if payload.status:
            sess["status"] = payload.status

        if self.db:
            try:
                db_session = self.db.query(Session).filter(Session.id == session_id).first()
                if db_session:
                    if payload.name:
                        db_session.name = payload.name
                    if payload.status:
                        db_session.status = payload.status
                    self.db.commit()
            except Exception:
                if self.db:
                    self.db.rollback()

        record_audit_event(self.db, user_id=user_id, action="SESSION_UPDATED", resource_type="session", resource_id=session_id)
        return sess

    def delete_session(self, session_id: str, user_id: str) -> bool:
        if self.db:
            try:
                db_session = self.db.query(Session).filter(Session.id == session_id).first()
                if db_session:
                    self.db.delete(db_session)
                    self.db.commit()
            except Exception:
                if self.db:
                    self.db.rollback()
        if session_id in self._in_memory_sessions:
            del self._in_memory_sessions[session_id]
        record_audit_event(self.db, user_id=user_id, action="SESSION_DELETED", resource_type="session", resource_id=session_id)
        return True
