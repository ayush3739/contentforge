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

    def get_audit_logs(self, limit: int = 50) -> list[dict]:
        if self.db:
            logs = self.db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
            return [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "details_json": log.details_json,
                    "created_at": log.created_at,
                }
                for log in logs
            ]
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
            return [
                {
                    "id": ev.id,
                    "event_type": ev.event_type,
                    "severity": ev.severity,
                    "source_ip": ev.source_ip,
                    "payload_summary": ev.payload_summary,
                    "details_json": ev.details_json,
                    "created_at": ev.created_at,
                }
                for ev in events
            ]
        return []

    def list_users(self) -> list[dict]:
        if self.db:
            users = self.db.query(User).all()
            return [
                {
                    "id": u.id,
                    "clerk_id": u.clerk_id,
                    "name": u.name,
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
