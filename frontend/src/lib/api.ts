import { SessionItem } from "@/types/session";
import { UserAccount, AuditLogItem, SecurityEventItem } from "@/types/admin";
import { useAuthStore } from "@/store/useAuthStore";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Helper to get Clerk token and user identity from window object or auth store (client-side only)
const getHeaders = async (includeContentType = true): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const clerk = (window as any).Clerk;
    let tokenSet = false;
    if (clerk?.session) {
      try {
        const token = await clerk.session.getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
          tokenSet = true;
        }
      } catch {
        // ignore — Clerk not loaded yet
      }
    }
    if (clerk?.user) {
      if (clerk.user.id) headers["X-User-Id"] = clerk.user.id;
      const email = clerk.user.primaryEmailAddress?.emailAddress;
      const name = clerk.user.fullName || clerk.user.username || (email ? email.split("@")[0] : null);
      if (email) headers["X-User-Email"] = email;
      if (name) headers["X-User-Name"] = name;
    }

    // Fallback to Zustand auth store if Clerk session is not active
    const authState = useAuthStore.getState();
    if (!tokenSet && authState.token) {
      headers["Authorization"] = authState.token.startsWith("Bearer ")
        ? authState.token
        : `Bearer ${authState.token}`;
    }
    if (!headers["X-User-Id"] && authState.user?.user_id) {
      headers["X-User-Id"] = authState.user.user_id;
    }
    if (!headers["X-User-Email"] && authState.user?.email) {
      headers["X-User-Email"] = authState.user.email;
    }
    if (!headers["X-User-Name"] && (authState.user?.username || authState.user?.user_id)) {
      headers["X-User-Name"] = authState.user.username || authState.user.user_id;
    }
    const activeRole = authState.activeRole || authState.user?.role || (clerk?.user?.publicMetadata?.role as string) || "analyst";
    headers["X-User-Role"] = activeRole;
    if (authState.activeRole) {
      headers["X-User-Role"] = authState.activeRole;
    }
  }
  return headers;
};

export async function downloadArtifactFile(artifactId: string, fallbackFilename?: string): Promise<void> {
  const headers = await getHeaders(false);
  const authState = useAuthStore.getState();
  const userId = headers["X-User-Id"] || authState.user?.user_id || "";
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  const res = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/download${query}`, {
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fallbackFilename || `artifact_${artifactId}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function createSession(data: { name: string; description?: string }): Promise<SessionItem> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function fetchSessions(): Promise<SessionItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) {
      console.warn(`[API] fetchSessions returned ${res.status}`);
      return [];
    }
    return res.json();
  } catch (err) {
    console.warn("[API] fetchSessions failed to connect:", err);
    return [];
  }
}

export async function fetchSession(sessionId: string): Promise<SessionItem> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "GET",
    headers: await getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

export async function uploadDocument(
  sessionId: string,
  file: File,
  onProgress?: (progress: number, message: string, stage: string) => void
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const authHeaders = await getHeaders(false);

  if (onProgress) {
    // SSE streaming upload
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/documents?stream=true`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload document");
    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let currentEvent = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6).trim());
            if (currentEvent === "progress") {
              onProgress(
                data.progress ?? 50,
                data.message || "Processing...",
                data.stage || currentEvent
              );
            }
          } catch {
            // ignore malformed SSE frames
          }
        }
      }
    }
    return { success: true };
  } else {
    // Non-streaming upload
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/documents`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload document");
    return res.json();
  }
}

export async function fetchDocumentCCO(documentId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/cco`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchDocumentEvidence(documentId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}/evidence`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchArtifacts(sessionId?: string): Promise<any[]> {
  try {
    const url = sessionId
      ? `${API_BASE_URL}/artifacts?session_id=${encodeURIComponent(sessionId)}`
      : `${API_BASE_URL}/artifacts`;
    const res = await fetch(url, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function submitTransformation(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/transformations`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit transformation");
  }
  return res.json();
}

export async function fetchTransformationStatus(transformationId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/transformations/${transformationId}/status`, {
    method: "GET",
    headers: await getHeaders(),
  });
  if (!res.ok) return { status: "PROCESSING" };
  return res.json();
}

/** Fetch a single artifact by ID from the backend with resilient retry. */
export async function fetchArtifact(artifactId: string, retries = 2): Promise<any> {
  let lastErr: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${artifactId}`, {
        method: "GET",
        headers: await getHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || errJson.message || `Artifact ${artifactId} not found (${res.status})`);
      }
      return await res.json();
    } catch (err: any) {
      lastErr = err;
      if (attempt < retries) {
        // Wait before retrying (useful during backend hot-reloads)
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastErr || new Error(`Failed to fetch artifact ${artifactId}`);
}

/** Fetch the full version history/lineage chain for an artifact. */
export async function fetchArtifactVersions(artifactId: string, retries = 1): Promise<any[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/versions`, {
        method: "GET",
        headers: await getHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }
  return [];
}

/** Returns the artifacts array from a completed transformation status response. */
export async function fetchArtifactsByTransformation(transformationId: string): Promise<any[]> {
  const status = await fetchTransformationStatus(transformationId);
  return status?.artifacts ?? [];
}

/** Fetch all generated artifacts for a session. */
export async function fetchSessionArtifacts(sessionId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/artifacts`, {
    method: "GET",
    headers: await getHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

/** Fetch system users for admin management */
export async function fetchUsers(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Update user RBAC role */
export async function updateUserRole(userId: string, role: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/roles`, {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// fetchReviewQueue and ReviewQueueItem removed for MVP

export async function finalizeArtifact(artifactId: string, notes?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/finalize`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to finalize artifact");
  }
  return res.json();
}

export async function reviseArtifact(artifactId: string, instructions: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/artifacts/${artifactId}/revise`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify({ instructions }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit revision");
  }
  return res.json();
}

/** Fetch system users from PostgreSQL admin API. */
export async function fetchAdminUsers(): Promise<UserAccount[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch admin users:", err);
    return [];
  }
}

/** Provision a new system user via admin API. */
export async function provisionAdminUser(payload: {
  email: string;
  name: string;
  role: string;
  clerk_id?: string;
}): Promise<UserAccount> {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.message || err.detail || err.message || "Failed to provision user");
  }
  return await res.json();
}

/** Fetch system audit logs from PostgreSQL admin API. */
export async function fetchAdminAuditLogs(limit = 100): Promise<AuditLogItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs?limit=${limit}`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch admin audit logs:", err);
    return [];
  }
}

/** Fetch security events & threat log from PostgreSQL admin API. */
export async function fetchAdminSecurityEvents(limit = 100): Promise<SecurityEventItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/security-events?limit=${limit}`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch admin security events:", err);
    return [];
  }
}

