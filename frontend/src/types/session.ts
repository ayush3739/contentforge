export interface SessionItem {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  status: "active" | "archived" | "completed" | "processing";
  document_count: number;
  transformation_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface SessionCreatePayload {
  name: string;
  description?: string;
}
