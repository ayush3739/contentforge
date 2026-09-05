"""
ContentForge AI — Transformation Request Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field
from app.schemas.enums import TransformationStatus
from app.renderers.template_registry import ArtifactTemplateConfig


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
    custom_instructions: Optional[str] = Field(None, description="Custom prompt or focus instructions from the user")
    template_configs: Optional[dict[str, ArtifactTemplateConfig]] = Field(None, description="Configurations mapped by output type")


class TransformationResponse(BaseModel):
    transformation_id: str
    session_id: str
    cco_version_id: Optional[str] = None
    requested_by: Optional[str] = None
    output_types: list[str]
    audience: str
    tone: str
    language: str
    detail_level: str
    objective: str
    style: str
    custom_instructions: Optional[str] = None
    template_configs: Optional[dict[str, ArtifactTemplateConfig]] = None
    status: TransformationStatus = TransformationStatus.QUEUED
    created_at: Optional[datetime] = None


class TransformationStatusResponse(BaseModel):
    transformation_id: str
    session_id: Optional[str] = None
    status: TransformationStatus
    progress_percentage: int = 0
    message: Optional[str] = None
    artifacts: list[dict[str, Any]] = []
    error: Optional[str] = None
