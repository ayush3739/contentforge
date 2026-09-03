"""
ContentForge AI — Transformation Request Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class TransformationCreate(BaseModel):
    session_id: str = Field(..., description="Target Session ID")
    source_document_id: Optional[str] = Field(None, description="Source Document ID to transform")
    cco_version_id: Optional[str] = Field(None, description="Direct CCO Version ID if already extracted")
    output_types: list[str] = Field(
        default=["executive_summary", "presentation"],
        description="Target artifact types e.g. presentation, executive_summary, advisory, etc."
    )
    audience: str = Field(default="senior leadership", description="Target audience level")
    tone: str = Field(default="professional", description="Tone e.g. professional, formal, persuasive")
    language: str = Field(default="English", description="Target language")
    detail_level: str = Field(default="concise", description="concise, balanced, detailed")
    objective: str = Field(default="decision briefing", description="Transformation objective")
    style: str = Field(default="formal", description="Formatting style requirement")


class TransformationResponse(BaseModel):
    transformation_id: str
    session_id: str
    cco_version_id: str
    requested_by: Optional[str] = None
    output_types: list[str]
    audience: str
    tone: str
    language: str
    detail_level: str
    objective: str
    style: str
    status: str = "QUEUED"
    created_at: Optional[datetime] = None


class TransformationStatusResponse(BaseModel):
    transformation_id: str
    status: str  # QUEUED, PROCESSING, GENERATING, VERIFYING, RENDERING, COMPLETED, FAILED, REVIEW_REQUIRED
    progress_percentage: int = 0
    message: Optional[str] = None
    artifacts: list[dict[str, Any]] = []
    error: Optional[str] = None
