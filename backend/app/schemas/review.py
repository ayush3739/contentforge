"""
ContentForge AI — Review Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class ReviewQueueItem(BaseModel):
    artifact_id: str
    transformation_request_id: str
    session_name: Optional[str] = None
    type: str
    version: int
    status: str
    grounding_score: float = 0.0
    issue_count: int = 0
    created_at: Optional[datetime] = None


class ReviewActionRequest(BaseModel):
    action: str = Field(..., description="approve, reject, revise")
    reason: Optional[str] = None
    notes: Optional[str] = None
