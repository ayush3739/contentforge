export enum DocumentStatus {
  UPLOADED = "UPLOADED",
  VALIDATING = "VALIDATING",
  INGESTING = "INGESTING",
  CCO_READY = "CCO_READY",
  FAILED = "FAILED",
}

export enum TransformationStatus {
  QUEUED = "QUEUED",
  PLANNING = "PLANNING",
  GENERATING = "GENERATING",
  VERIFYING = "VERIFYING",
  RENDERING = "RENDERING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ArtifactStatus {
  GENERATED = "GENERATED",
  VERIFYING = "VERIFYING",
  PASSED = "PASSED",
  REVISION_REQUIRED = "REVISION_REQUIRED",
  FAILED = "FAILED",
  FINALIZED = "FINALIZED",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  PASSED = "PASSED",
  REVISION_REQUIRED = "REVISION_REQUIRED",
  FAILED = "FAILED",
}

export enum JobStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  RETRYING = "RETRYING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface ArtifactTemplateConfig {
  artifact_type: string;
  template_id: string;
  brand_theme?: string;
  orientation?: string;
  length?: string;
  include_evidence_refs?: boolean;
  include_verification_footer?: boolean;
  output_options?: Record<string, any>;
}
