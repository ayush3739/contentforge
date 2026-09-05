from datetime import datetime
from typing import Any, Optional
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from app.schemas.enums import JobStatus, TransformationStatus


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
    template_configs: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    status: Mapped[TransformationStatus] = mapped_column(Enum(TransformationStatus), default=TransformationStatus.QUEUED, nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="transformation_requests")
    cco_version: Mapped["CCOVersion"] = relationship("CCOVersion", back_populates="transformation_requests")
    artifacts: Mapped[list["Artifact"]] = relationship("Artifact", back_populates="transformation_request", cascade="all, delete-orphan")
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="transformation_request", cascade="all, delete-orphan")


class Job(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "jobs"

    job_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    job_type: Mapped[str] = mapped_column(String(50), default="transformation", nullable=False)  # transformation, ingestion
    transformation_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("transformation_requests.id", ondelete="CASCADE"), nullable=True, index=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    document_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)

    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_stage: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    worker_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payload_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    result_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    transformation_request: Mapped[Optional["TransformationRequest"]] = relationship("TransformationRequest", back_populates="jobs")
    session: Mapped[Optional["Session"]] = relationship("Session")
    document: Mapped[Optional["Document"]] = relationship("Document")


class TransformationRecipe(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transformation_recipes"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    target_artifact_type: Mapped[str] = mapped_column(String(50), nullable=False)  # presentation, executive_summary, advisory, etc.
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    config_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
