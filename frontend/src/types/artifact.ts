export interface SlideData {
  slide_number: number;
  title: string;
  key_message: string;
  body: string[];
  speaker_notes?: string;
  evidence_refs?: string[];
}

export interface ClaimCheck {
  claim: string;
  status: "supported" | "flagged" | "unsupported";
  reason?: string;
  evidence_ref?: string;
}

export interface VerificationReport {
  status: "PASSED" | "REVIEW_REQUIRED" | "FAILED";
  grounding_score: number;
  consistency_score: number;
  unsupported_claim_count: number;
  issues: ClaimCheck[];
}

export interface ArtifactItem {
  artifact_id: string;
  transformation_request_id: string;
  cco_version_id: string;
  type: string;
  version: number;
  status: "generating" | "generated" | "verified" | "approved" | "rejected" | "review_required";
  filename: string;
  download_url?: string;
  checksum?: string;
  content_json: Record<string, any>;
  verification: VerificationReport;
  created_at?: string;
}
