"""
ContentForge AI -- Artifact & Verification Schemas
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field
from app.schemas.enums import ArtifactStatus, VerificationStatus


class ProvenanceInfo(BaseModel):
    """Cryptographic provenance ledger status for a finalized artifact."""
    status: str  # NONE | PENDING | ANCHORED
    reference: Optional[str] = None
    artifact_hash: Optional[str] = None
    verification_hash: Optional[str] = None
    ledger_tx_id: Optional[str] = None
    anchored_at: Optional[str] = None


class ArtifactResponse(BaseModel):
    artifact_id: str
    transformation_request_id: Optional[str] = None
    cco_version_id: Optional[str] = None
    type: str  # presentation, executive_summary, advisory, etc.
    version: int = 1
    parent_artifact_id: Optional[str] = None
    status: ArtifactStatus = ArtifactStatus.GENERATING
    filename: Optional[str] = None
    download_url: Optional[str] = None
    checksum: Optional[str] = None
    template_config: Optional[dict[str, Any]] = None
    render_error: Optional[str] = None
    content_json: dict[str, Any] = {}
    verification: dict[str, Any] = {}
    provenance: Optional[ProvenanceInfo] = None
    created_at: Optional[datetime] = None


class ArtifactVersionResponse(BaseModel):
    artifact_id: str
    version: int
    status: ArtifactStatus
    checksum: Optional[str] = None
    download_url: Optional[str] = None
    created_at: Optional[datetime] = None
    parent_artifact_id: Optional[str] = None


class ArtifactVerificationResponse(BaseModel):
    artifact_id: str
    status: VerificationStatus
    grounding_score: float
    consistency_score: float
    unsupported_claim_count: int
    issues: list[dict[str, Any]] = []


class ArtifactReviseRequest(BaseModel):
    instructions: str = Field(..., min_length=3, description="Revision feedback/prompt adjustments")
    target_sections: Optional[list[str]] = Field(None, description="Specific sections to modify")


class ArtifactFinalizeRequest(BaseModel):
    notes: Optional[str] = Field(None, description="Optional finalization notes or owner signature")
