import { Role } from "./auth";

export interface UserAccount {
  id: string;
  clerk_id?: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  created_at?: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details_json?: Record<string, any>;
  created_at?: string;
}

export interface SecurityEventItem {
  id: string;
  event_type: string;
  severity: "low" | "medium" | "high" | "critical";
  source_ip?: string;
  payload_summary?: string;
  details_json?: Record<string, any>;
  created_at?: string;
}
