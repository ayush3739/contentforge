from typing import Optional
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Document(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "documents"

    session_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    checksum: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # SHA-256
    storage_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ready", nullable=False)  # uploaded, parsing, parsed, indexing, ready, failed
    created_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    session: Mapped[Optional["Session"]] = relationship("Session", back_populates="documents")
    source_blocks: Mapped[list["SourceBlock"]] = relationship("SourceBlock", back_populates="document", cascade="all, delete-orphan")
    chunks: Mapped[list["Chunk"]] = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    cco_versions: Mapped[list["CCOVersion"]] = relationship("CCOVersion", back_populates="document", cascade="all, delete-orphan")
