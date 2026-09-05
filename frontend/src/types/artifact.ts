import { ArtifactStatus, VerificationStatus } from "./enums";

export interface SlideData {
  slide_number: number;
  title: string;
  key_message: string;
  body: string[];
  speaker_notes?: string;
  evidence_refs?: string[];
}

export interface VerificationIssueItem {
  id?: string;
  claim?: string;
  status?: "supported" | "flagged" | "unsupported" | string;
  severity?: "HIGH" | "MEDIUM" | "LOW" | string;
  category?: string;
  location?: string;
  offending_text?: string;
  suggested_fix?: string;
  evidence_id?: string;
  reason?: string;
  evidence_ref?: string;
}

export interface VerificationReport {
  status: VerificationStatus | "PASSED" | "REVISION_REQUIRED" | "FAILED" | string;
  grounding_score: number;
  consistency_score: number;
  unsupported_claim_count: number;
  citation_coverage?: number;
  issues?: VerificationIssueItem[];
  unsupported_claims?: string[];
}

export interface ProvenanceInfo {
  /** NONE = never finalized, PENDING = finalized awaiting anchor, ANCHORED = ledger confirmed */
  status: "NONE" | "PENDING" | "ANCHORED" | string;
  reference?: string;         // ProvenanceRecord UUID e.g. PRV-XXXXXXXX
  artifact_hash?: string;     // SHA-256 of stored binary deliverable
  verification_hash?: string; // SHA-256 of verification report JSON
  ledger_tx_id?: string;      // Hyperledger Fabric transaction ID (PENDING until confirmed)
  anchored_at?: string;       // ISO-8601 timestamp of anchoring
}

export interface ArtifactVersionItem {
  artifact_id: string;
  version: number;
  status: ArtifactStatus | string;
  checksum?: string;
  download_url?: string;
  created_at?: string;
  parent_artifact_id?: string;
}

export interface ArtifactItem {
  artifact_id: string;
  transformation_request_id: string;
  cco_version_id: string;
  type: string;
  version: number;
  parent_artifact_id?: string;
  status: ArtifactStatus | string;
  filename: string;
  download_url?: string;
  checksum?: string;
  storage_key?: string;
  template_id?: string;
  template_config?: Record<string, any>;
  render_error?: string;
  classification?: string;
  content_json: Record<string, any>;
  verification?: VerificationReport;
  provenance?: ProvenanceInfo;
  created_at?: string;
  available_formats?: string[];
}
