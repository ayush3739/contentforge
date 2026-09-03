from typing import Any, Optional
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # login, upload, transform, verify, approve, export
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)  # session, document, cco, artifact
    resource_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    details_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)


class SecurityEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "security_events"

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # prompt_injection_detected, rbac_denial, rate_limit
    severity: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high, critical
    source_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    payload_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
