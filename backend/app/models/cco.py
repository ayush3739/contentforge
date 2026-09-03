from typing import Any, Optional
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class CCOVersion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "cco_versions"

    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    cco_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, superseded, archived
    created_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="cco_versions")
    transformation_requests: Mapped[list["TransformationRequest"]] = relationship("TransformationRequest", back_populates="cco_version")
    artifacts: Mapped[list["Artifact"]] = relationship("Artifact", back_populates="cco_version")
