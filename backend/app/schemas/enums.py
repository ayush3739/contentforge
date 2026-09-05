from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field

class DocumentStatus(str, Enum):
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    INGESTING = "INGESTING"
    CCO_READY = "CCO_READY"
    FAILED = "FAILED"

class TransformationStatus(str, Enum):
    QUEUED = "QUEUED"
    PLANNING = "PLANNING"
    GENERATING = "GENERATING"
    VERIFYING = "VERIFYING"
    RENDERING = "RENDERING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ArtifactStatus(str, Enum):
    GENERATING = "GENERATING"
    GENERATED = "GENERATED"
    VERIFYING = "VERIFYING"
    PASSED = "PASSED"
    REVISION_REQUIRED = "REVISION_REQUIRED"
    FAILED = "FAILED"
    FINALIZED = "FINALIZED"

class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    PASSED = "PASSED"
    REVISION_REQUIRED = "REVISION_REQUIRED"
    FAILED = "FAILED"

class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    RETRYING = "RETRYING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class ArtifactTemplateConfig(BaseModel):
    artifact_type: str = Field(..., description="The broad type of artifact (e.g., presentation, executive_summary, infographic)")
    template_id: str = Field(..., description="The specific template identifier to use for rendering")
    brand_theme: str = Field("default", description="The design system theme to apply")
    orientation: str = Field("landscape", description="Orientation for the output (landscape or portrait)")
    length: str = Field("standard", description="Target length of the artifact (short, standard, long)")
    include_evidence_refs: bool = Field(True, description="Whether to include visible source evidence references")
    include_verification_footer: bool = Field(True, description="Whether to include the automated verification footer")
    output_options: Optional[dict[str, Any]] = Field(default_factory=dict, description="Additional options specific to the template")
