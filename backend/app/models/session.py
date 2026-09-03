from typing import Optional
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Session(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sessions"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    creator: Mapped[Optional["User"]] = relationship("User", back_populates="sessions")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="session", cascade="all, delete-orphan")
    transformation_requests: Mapped[list["TransformationRequest"]] = relationship("TransformationRequest", back_populates="session", cascade="all, delete-orphan")
