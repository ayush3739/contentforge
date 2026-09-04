"""
ContentForge AI — Workspace Session Service
"""

import logging
import uuid
from typing import Any, Optional
from sqlalchemy.orm import Session as DBSession
from app.audit.logger import record_audit_event
from app.models.session import Session
from app.models.document import Document
from app.models.transformation import TransformationRequest
from app.models.user import User
from app.schemas.session import SessionCreate, SessionUpdate

logger = logging.getLogger("app.services.session")


class SessionService:
    _in_memory_sessions: dict[str, dict] = {}

    def __init__(self, db: Optional[DBSession] = None):
        self.db = db

    def create_session(
        self,
        payload: SessionCreate,
        user_id: Optional[str] = None,
        user: Optional[Any] = None,
    ) -> dict:
        uid = user.user_id if user and user.user_id else (user_id or "USR-DEFAULT-001")
        session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
        actual_user_id = uid

        email = user.email if user and user.email else f"{uid}@contentforge.local"
        name = user.username if user and user.username else (email.split("@")[0] if "@" in email else uid)
        clerk_id = user.clerk_id if user and user.clerk_id else uid
        role = user.role if user and user.role else "analyst"

        if self.db:
            try:
                # Ensure user exists in users table with real email and name
                if uid:
                    existing_user = self.db.query(User).filter(
                        (User.id == uid) | (User.clerk_id == clerk_id) | (User.email == email)
                    ).first()
                    if not existing_user:
                        new_user = User(
                            id=uid if len(uid) <= 36 else str(uuid.uuid4()),
                            clerk_id=clerk_id,
                            name=name,
                            email=email,
                            role=role,
                            status="active",
                        )
                        self.db.add(new_user)
                        self.db.flush()
                        actual_user_id = new_user.id
                    else:
                        # Update placeholder data if real email or name is now available
                        if existing_user.email.endswith("@contentforge.local") and not email.endswith("@contentforge.local"):
                            existing_user.email = email
                        if (existing_user.name == existing_user.id or existing_user.name.startswith("USR-")) and name:
                            existing_user.name = name
                        if clerk_id and not existing_user.clerk_id:
                            existing_user.clerk_id = clerk_id
                        actual_user_id = existing_user.id

                db_session = Session(
                    id=session_id,
                    name=payload.name,
                    created_by=actual_user_id,
                    status="active",
                )
                self.db.add(db_session)
                self.db.commit()
                self.db.refresh(db_session)
                logger.info(f"[SESSION] Successfully persisted session {session_id} ('{payload.name}') to PostgreSQL database.")
            except Exception as e:
                logger.error(f"[SESSION] Database commit failed for session {session_id}: {e}")
                if self.db:
                    self.db.rollback()

        sess_data = {
            "id": session_id,
            "name": payload.name,
            "created_by": actual_user_id,
            "status": "active",
            "document_count": 0,
            "transformation_count": 0,
        }
        self._in_memory_sessions[session_id] = sess_data
        record_audit_event(self.db, user_id=actual_user_id, action="SESSION_CREATED", resource_type="session", resource_id=session_id)
        return sess_data

    def get_session(self, session_id: str) -> Optional[dict]:
        if self.db:
            try:
                db_session = self.db.query(Session).filter(Session.id == session_id).first()
                if db_session:
                    docs = [
                        {
                            "id": d.id,
                            "session_id": d.session_id,
                            "name": d.name,
                            "mime_type": d.mime_type,
                            "version": d.version,
                            "status": d.status,
                            "checksum": d.checksum,
                            "storage_key": d.storage_key,
                            "created_at": d.created_at,
                        }
                        for d in (db_session.documents or [])
                    ]
                    trans = [
                        {
                            "id": t.id,
                            "session_id": t.session_id,
                            "cco_version_id": t.cco_version_id,
                            "output_types": t.output_types,
                            "audience": t.audience,
                            "tone": t.tone,
                            "status": t.status,
                            "created_at": t.created_at,
                        }
                        for t in (db_session.transformation_requests or [])
                    ]
                    return {
                        "id": db_session.id,
                        "name": db_session.name,
                        "created_by": db_session.created_by,
                        "status": db_session.status,
                        "document_count": len(docs),
                        "transformation_count": len(trans),
                        "documents": docs,
                        "transformation_requests": trans,
                        "created_at": db_session.created_at,
                        "updated_at": db_session.updated_at,
                    }
            except Exception as e:
                logger.error(f"[SESSION] Database query failed for session {session_id}: {e}")
        return self._in_memory_sessions.get(session_id)

    def list_sessions(self, user_id: Optional[str] = None) -> list[dict]:
        if self.db:
            try:
                query = self.db.query(Session)
                if user_id:
                    query = query.filter((Session.created_by == user_id) | (Session.created_by.is_(None)))
                sessions = query.order_by(Session.created_at.desc()).all()
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
            except Exception as e:
                logger.error(f"[SESSION] Database query failed for list_sessions: {e}")
        
        items = list(self._in_memory_sessions.values())
        if user_id:
            return [s for s in items if (s.get("created_by") == user_id or s.get("created_by") is None)]
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

        self._in_memory_sessions[session_id] = sess
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

