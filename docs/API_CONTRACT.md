# API Contract (reference — P3 owns implementation)

> Source of truth: `documents/00_TEAM_INTEGRATION_CONTRACT.md` §8 (full contract) cross-checked against `documents/03_P3_BACKEND_API.md` §route list (P3's own implementation subset). No conflicts found between the two — Doc 03 implements a subset of Doc 00's routes; where Doc 03 is silent, Doc 00 governs. **P5 does not implement any of these endpoints.**

Base path: `/api/v1`

## Auth
```
POST /auth/login
GET  /auth/me
POST /auth/logout
```

## Sessions
```
POST  /sessions
GET   /sessions
GET   /sessions/{session_id}
PATCH /sessions/{session_id}
```

## Documents
```
POST /sessions/{session_id}/documents
GET  /documents/{document_id}
GET  /documents/{document_id}/versions
GET  /documents/{document_id}/cco
GET  /documents/{document_id}/evidence
```

## Transformation (P3 endpoint fronting P1's AI pipeline)
```
POST /transformations
GET  /transformations/{transformation_id}
POST /transformations/{transformation_id}/generate
GET  /transformations/{transformation_id}/status
```

## Artifacts
```
GET  /artifacts/{artifact_id}
GET  /artifacts/{artifact_id}/versions
GET  /artifacts/{artifact_id}/download
POST /artifacts/{artifact_id}/finalize
```

## Verification
```
GET  /artifacts/{artifact_id}/verification
POST /artifacts/{artifact_id}/verify
POST /artifacts/{artifact_id}/revise
```

## Admin (requires `admin` role — see docs/RBAC.md)
```
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/{user_id}
PATCH  /admin/users/{user_id}/roles
GET    /admin/audit-logs
GET    /admin/security-events
GET    /admin/config
```

## Provenance (P5-defined data, P3-exposed endpoint)
```
GET  /provenance/{artifact_id}
POST /provenance/{artifact_id}/anchor
POST /provenance/{artifact_id}/verify
```
`infrastructure/provenance/` (this repo) provides the hashing + verification logic these endpoints should call into — see docs/PROVENANCE.md.

## Cross-cutting expectations (P5-owned contract, applies to every route above)

- **Authentication:** Bearer JWT in `Authorization` header, issued by `/auth/login`. P3 implements issuance/validation; `JWT_SECRET`/`JWT_ALGORITHM`/`ACCESS_TOKEN_EXPIRE_MINUTES` are the shared config (see `.env.example`).
- **Authorization:** every route enforces the permission matrix in `docs/RBAC.md` server-side. No exceptions.
- **Request ID:** every request should carry/receive an `X-Request-ID` header (generate one if absent) so logs/audit records can be correlated. See `infrastructure/logging/`.
- **Error format:** JSON body `{"error": {"code": "...", "message": "...", "request_id": "..."}}` on non-2xx responses. (P5 recommendation — P3 may adjust the exact shape as long as `request_id` is included somewhere in the error body.)
- **Long-running jobs:** `POST /transformations` and `POST /transformations/{id}/generate` must return immediately with a job/transformation id and status `QUEUED`/`REQUESTED` — never block the HTTP request thread on the LLM call. Clients poll `GET /transformations/{id}/status` (see `docs/STATUS_VALUES.md`).
- **Artifact download behavior:** `GET /artifacts/{id}/download` must **not** stream the binary as the body of a synchronous long-running request. It should either (a) return a short-lived pre-signed storage URL (see `docs/STORAGE_CONTRACT.md` §5), or (b) proxy-stream only once the artifact is already `GENERATED`/`FINALIZED`. Large generated files are never the primary response of a transformation request.
- **Status handling:** all status fields use the vocabulary in `docs/STATUS_VALUES.md` — see that doc for a flagged naming conflict between Doc 00 and Doc 03 that P1/P3 need to resolve.
