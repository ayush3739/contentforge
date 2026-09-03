"""
ContentForge AI — Artifact & Verification Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class ArtifactResponse(BaseModel):
    artifact_id: str
    transformation_request_id: str
    cco_version_id: str
    type: str  # presentation, executive_summary, advisory, etc.
    version: int = 1
    status: str = "generating"  # generating, verified, approved, rejected, review_required
    filename: str
    download_url: Optional[str] = None
    checksum: Optional[str] = None
    content_json: dict[str, Any] = {}
    verification: dict[str, Any] = {}
    created_at: Optional[datetime] = None


class ArtifactVersionResponse(BaseModel):
    artifact_id: str
    version: int
    status: str
    checksum: Optional[str] = None
    download_url: Optional[str] = None
    created_at: Optional[datetime] = None


class ArtifactVerificationResponse(BaseModel):
    artifact_id: str
    status: str  # PASSED, REVIEW_REQUIRED, FAILED
    grounding_score: float
    consistency_score: float
    unsupported_claim_count: int
    issues: list[dict[str, Any]] = []


class ArtifactReviseRequest(BaseModel):
    instructions: str = Field(..., min_length=3, description="Revision feedback/prompt adjustments")
    target_sections: Optional[list[str]] = Field(None, description="Specific sections to modify")


class ArtifactFinalizeRequest(BaseModel):
    action: str = Field(..., description="approve or reject")
    comments: Optional[str] = Field(None, description="Reviewer feedback or sign-off notes")
