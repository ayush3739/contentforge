export interface DocumentItem {
  id: string;
  session_id?: string;
  name: string;
  mime_type: string;
  version: number;
  checksum?: string;
  storage_key?: string;
  status: "uploaded" | "parsing" | "parsed" | "indexing" | "ready" | "failed";
  created_by?: string;
  created_at?: string;
}

export interface CCOClaim {
  id: string;
  text: string;
  source_sentence?: string;
  confidence: number;
  evidence_refs?: string[];
  status?: string;
}

export interface CCOData {
  document_id: string;
  cco_version_id: string;
  version: number;
  hash: string;
  title?: string;
  executive_overview?: string;
  claims: CCOClaim[];
  identifiers?: string[];
  key_findings?: string[];
  cco_json?: Record<string, any>;
}

export interface EvidenceChunk {
  chunk_id: string;
  text: string;
  section: string;
  page: number;
}
