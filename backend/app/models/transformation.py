from typing import Any, Optional
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class TransformationRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transformation_requests"

    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    cco_version_id: Mapped[str] = mapped_column(String(36), ForeignKey("cco_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    output_types: Mapped[list[str]] = mapped_column(JSONB, nullable=False)  # ["presentation", "executive_summary", ...]
    audience: Mapped[str] = mapped_column(String(100), default="general", nullable=False)
    tone: Mapped[str] = mapped_column(String(100), default="professional", nullable=False)
    language: Mapped[str] = mapped_column(String(50), default="en", nullable=False)
    detail_level: Mapped[str] = mapped_column(String(50), default="balanced", nullable=False)  # concise, balanced, detailed
    objective: Mapped[str] = mapped_column(String(255), default="inform", nullable=False)
    style: Mapped[str] = mapped_column(String(100), default="standard", nullable=False)
    custom_instructions: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="queued", nullable=False)  # queued, in_progress, completed, failed

    session: Mapped["Session"] = relationship("Session", back_populates="transformation_requests")
    cco_version: Mapped["CCOVersion"] = relationship("CCOVersion", back_populates="transformation_requests")
    artifacts: Mapped[list["Artifact"]] = relationship("Artifact", back_populates="transformation_request", cascade="all, delete-orphan")


class TransformationRecipe(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transformation_recipes"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    target_artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)  # presentation, executive_summary, advisory, etc.
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    config_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
