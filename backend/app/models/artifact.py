from typing import Any, Optional
from sqlalchemy import Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin
from app.schemas.enums import ArtifactStatus, VerificationStatus


class Artifact(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "artifacts"

    transformation_request_id: Mapped[str] = mapped_column(String(36), ForeignKey("transformation_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    cco_version_id: Mapped[str] = mapped_column(String(36), ForeignKey("cco_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # presentation, executive_summary, advisory, infographic, etc.
    status: Mapped[ArtifactStatus] = mapped_column(Enum(ArtifactStatus), default=ArtifactStatus.GENERATING, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    content_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    revision_history: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(JSONB, default=list, nullable=True)
    template_config: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    parent_artifact_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("artifacts.id", ondelete="SET NULL"), nullable=True, index=True)
    storage_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # For rendered file binaries (PPTX/PDF/DOCX)
    checksum: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # SHA-256
    render_error: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)

    transformation_request: Mapped["TransformationRequest"] = relationship("TransformationRequest", back_populates="artifacts")
    cco_version: Mapped["CCOVersion"] = relationship("CCOVersion", back_populates="artifacts")
    verification_results: Mapped[list["VerificationResult"]] = relationship("VerificationResult", back_populates="artifact", cascade="all, delete-orphan")
    provenance_records: Mapped[list["ProvenanceRecord"]] = relationship("ProvenanceRecord", back_populates="artifact", cascade="all, delete-orphan")


class VerificationResult(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "verification_results"

    artifact_id: Mapped[str] = mapped_column(String(36), ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    grounding_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    consistency_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    unsupported_claim_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    issues_json: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(JSONB, nullable=True)

    artifact: Mapped["Artifact"] = relationship("Artifact", back_populates="verification_results")
