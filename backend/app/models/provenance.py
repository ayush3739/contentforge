from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ProvenanceRecord(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "provenance_records"

    artifact_id: Mapped[str] = mapped_column(String(36), ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False, index=True)
    cco_version_id: Mapped[str] = mapped_column(String(36), ForeignKey("cco_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    artifact_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256
    verification_hash: Mapped[str] = mapped_column(String(64), nullable=False)  # SHA-256
    ledger_tx_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Hyperledger Fabric transaction ID
    anchored_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    artifact: Mapped["Artifact"] = relationship("Artifact", back_populates="provenance_records")
