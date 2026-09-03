"""
ContentForge AI — Append-Only Audit & Security Event Logger

Supports Section 23 & 24 of Specification:
Records non-repudiable audit trails and security events to PostgreSQL database.
"""

import logging
from typing import Any, Optional
from sqlalchemy.orm import Session as DBSession
from app.models.audit import AuditLog, SecurityEvent

logger = logging.getLogger("app.audit.logger")


def record_audit_event(
    db: Optional[DBSession],
    user_id: Optional[str],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> Optional[AuditLog]:
    """
    Persists append-only application audit log record.
    """
    logger.info(f"[AUDIT] user={user_id} action={action} resource={resource_type}:{resource_id}")
    if db is None:
        return None

    try:
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details_json=details or {},
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
    except Exception as e:
        logger.error(f"Failed to record audit log entry: {e}")
        db.rollback()
        return None


def record_security_event(
    db: Optional[DBSession],
    event_type: str,
    severity: str = "medium",
    source_ip: Optional[str] = None,
    payload_summary: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> Optional[SecurityEvent]:
    """
    Persists security event (prompt injection, RBAC failure, file compromise, etc.).
    """
    logger.warning(f"[SECURITY_EVENT] severity={severity} type={event_type} ip={source_ip}")
    if db is None:
        return None

    try:
        sec_entry = SecurityEvent(
            event_type=event_type,
            severity=severity,
            source_ip=source_ip,
            payload_summary=payload_summary,
            details_json=details or {},
        )
        db.add(sec_entry)
        db.commit()
        db.refresh(sec_entry)
        return sec_entry
    except Exception as e:
        logger.error(f"Failed to record security event: {e}")
        db.rollback()
        return None
