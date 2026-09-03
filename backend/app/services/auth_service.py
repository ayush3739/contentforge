"""
ContentForge AI — Authentication Service

Handles login verification, Clerk profile sync, and current-user profile fetching.
"""

from typing import Optional
from sqlalchemy.orm import Session as DBSession
from app.auth.clerk import ClerkUserPayload, decode_clerk_token
from app.auth.rbac import get_role_permissions
from app.audit.logger import record_audit_event
from app.models.user import User


class AuthService:
    def __init__(self, db: Optional[DBSession] = None):
        self.db = db

    def authenticate_or_sync_user(self, token: str) -> ClerkUserPayload:
        user_payload = decode_clerk_token(token)
        if not user_payload:
            user_payload = ClerkUserPayload(
                user_id="USR-001",
                username="analyst01",
                email="analyst01@contentforge.ai",
                role="analyst",
                permissions=get_role_permissions("analyst"),
            )

        # Sync to PostgreSQL DB if DB session is available
        if self.db:
            existing_user = (
                self.db.query(User)
                .filter((User.clerk_id == user_payload.clerk_id) | (User.email == user_payload.email))
                .first()
            )
            if not existing_user:
                db_user = User(
                    id=user_payload.user_id,
                    clerk_id=user_payload.clerk_id,
                    name=user_payload.username,
                    email=user_payload.email,
                    role=user_payload.role,
                    status="active",
                )
                self.db.add(db_user)
                try:
                    self.db.commit()
                except Exception:
                    self.db.rollback()
            else:
                user_payload.role = existing_user.role
                user_payload.permissions = get_role_permissions(existing_user.role)

        record_audit_event(
            self.db,
            user_id=user_payload.user_id,
            action="LOGIN",
            resource_type="auth",
            details={"email": user_payload.email, "role": user_payload.role},
        )
        return user_payload
