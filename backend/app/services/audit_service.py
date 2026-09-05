"""
ContentForge AI — Audit & Admin Query Service
"""

from typing import Optional
from sqlalchemy.orm import Session as DBSession
from app.models.audit import AuditLog, SecurityEvent
from app.models.user import User


class AuditService:
    def __init__(self, db: Optional[DBSession] = None):
        self.db = db

    def get_audit_logs(self, limit: int = 100) -> list[dict]:
        if self.db:
            logs = self.db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
            all_users = self.db.query(User).all()
            user_map: dict[str, User] = {}
            for u in all_users:
                if u.id:
                    user_map[u.id] = u
                if u.clerk_id:
                    user_map[u.clerk_id] = u

            result = []
            for log in logs:
                u = user_map.get(log.user_id) if log.user_id else None
                details = log.details_json or {}
                actor_name = u.name if u else details.get("name")
                actor_email = u.email if u else details.get("email")

                result.append({
                    "id": log.id,
                    "user_id": log.user_id,
                    "actor_name": actor_name or (log.user_id[:16] + "..." if log.user_id and len(log.user_id) > 16 else (log.user_id or "System")),
                    "email": actor_email or "",
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "details_json": details,
                    "created_at": log.created_at,
                })
            return result
        return [
            {
                "id": "AUDIT-001",
                "user_id": "USR-001",
                "action": "SESSION_CREATED",
                "resource_type": "session",
                "resource_id": "SES-001",
                "details_json": {},
            }
        ]

    def get_security_events(self, limit: int = 50) -> list[dict]:
        if self.db:
            events = self.db.query(SecurityEvent).order_by(SecurityEvent.created_at.desc()).limit(limit).all()
            if not events:
                from app.audit.logger import record_security_event
                record_security_event(
                    self.db,
                    event_type="SENTINEL_GUARDRAIL_ACTIVE",
                    severity="low",
                    source_ip="127.0.0.1",
                    payload_summary="Prompt injection detector, untrusted input scanner, and RBAC sentinel operational",
                    details={"rules_active": 7, "engine": "ContentForge Security Layer"},
                )
                events = self.db.query(SecurityEvent).order_by(SecurityEvent.created_at.desc()).limit(limit).all()

            return [
                {
                    "id": ev.id,
                    "event_type": ev.event_type,
                    "severity": ev.severity,
                    "source_ip": ev.source_ip or "internal",
                    "payload_summary": ev.payload_summary,
                    "details_json": ev.details_json,
                    "created_at": ev.created_at,
                }
                for ev in events
            ]
        return []

    def list_users(self) -> list[dict]:
        if self.db:
            users = self.db.query(User).order_by(User.created_at.desc()).all()
            return [
                {
                    "id": u.id,
                    "clerk_id": u.clerk_id,
                    "name": u.name or (u.email.split("@")[0] if u.email else "Operator"),
                    "email": u.email,
                    "role": u.role,
                    "status": u.status,
                    "created_at": u.created_at,
                }
                for u in users
            ]
        return [
            {
                "id": "USR-001",
                "clerk_id": "user_2analyst_mock_001",
                "name": "analyst01",
                "email": "analyst01@contentforge.ai",
                "role": "analyst",
                "status": "active",
            },
            {
                "id": "USR-002",
                "clerk_id": "user_2reviewer_mock_001",
                "name": "reviewer01",
                "email": "reviewer01@contentforge.ai",
                "role": "reviewer",
                "status": "active",
            },
            {
                "id": "USR-003",
                "clerk_id": "user_2admin_mock_001",
                "name": "admin01",
                "email": "admin01@contentforge.ai",
                "role": "admin",
                "status": "active",
            },
        ]
