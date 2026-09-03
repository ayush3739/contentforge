"""
ContentForge AI — Session Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Session workspace name")
    description: Optional[str] = None


class SessionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None, description="active, archived, completed")


class SessionResponse(BaseModel):
    id: str
    name: str
    created_by: Optional[str] = None
    status: str = "active"
    document_count: int = 0
    transformation_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SessionDetailResponse(SessionResponse):
    documents: list[dict[str, Any]] = []
    transformation_requests: list[dict[str, Any]] = []
