# Person 3 — Backend/API + Database Engineer
## Owner: FastAPI Application Layer + Persistence + Jobs

## 1. Mission

Build the application backend that connects the frontend, AI engine, artifact engine and infrastructure.

You own **public APIs and persistence**, while P1 owns AI logic.

---

# 2. Backend Structure

```text
backend/
├── app/
│   ├── api/
│   ├── auth/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── jobs/
│   └── main.py
├── migrations/
└── tests/
```

---

# 3. Responsibilities

Own:

- FastAPI
- API routing
- validation
- DB models
- migrations
- sessions
- documents
- transformations
- artifacts metadata
- auth integration
- RBAC middleware
- job orchestration
- audit event persistence

Do not implement AI logic inside route handlers.

---

# 4. API Routes

```http
POST /api/v1/auth/login
GET  /api/v1/auth/me

POST /api/v1/sessions
GET  /api/v1/sessions
GET  /api/v1/sessions/{id}
PATCH /api/v1/sessions/{id}

POST /api/v1/sessions/{id}/documents
GET  /api/v1/documents/{id}
GET  /api/v1/documents/{id}/versions
GET  /api/v1/documents/{id}/cco
GET  /api/v1/documents/{id}/evidence

POST /api/v1/transformations
GET  /api/v1/transformations/{id}
GET  /api/v1/transformations/{id}/status

GET  /api/v1/artifacts/{id}
GET  /api/v1/artifacts/{id}/versions
GET  /api/v1/artifacts/{id}/download

GET  /api/v1/artifacts/{id}/verification
POST /api/v1/artifacts/{id}/finalize

GET  /api/v1/admin/users
POST /api/v1/admin/users
PATCH /api/v1/admin/users/{id}
PATCH /api/v1/admin/users/{id}/roles
GET /api/v1/admin/audit-logs
GET /api/v1/admin/security-events
```

---

# 5. Request Schema

Transformation request:

```json
{
  "session_id": "...",
  "output_types": [
    "executive_summary",
    "presentation"
  ],
  "audience": "senior leadership",
  "tone": "professional",
  "language": "English",
  "detail_level": "concise",
  "objective": "decision briefing",
  "style": "formal"
}
```

---

# 6. Database

Use:

```text
PostgreSQL
+
pgvector
```

Core entities:

```text
users
roles
user_roles
sessions
documents
document_versions
source_blocks
chunks
cco_versions
transformation_requests
transformation_recipes
artifacts
artifact_versions
verification_results
provenance_records
audit_logs
security_events
```

Use migrations.

Never let teammates manually change production schema.

---

# 7. JSONB

CCO is naturally semi-structured.

Use PostgreSQL JSONB for:

```text
cco_json
issues_json
metadata_json
```

Keep high-value relational identifiers as proper columns.

---

# 8. Object Storage

Do not store binary source/artifact files in PostgreSQL.

Store:

```text
storage_key
mime_type
checksum
size
```

in PostgreSQL.

Actual file:

```text
Object Storage
```

---

# 9. AI Integration

Backend receives:

```text
POST /transformations
```

Then:

```text
validate request
 ↓
create transformation record
 ↓
queue job
 ↓
P1 AI service
 ↓
store AI result
 ↓
P4 artifact service
 ↓
verification
 ↓
update status
```

Do not keep a long LLM process inside the request thread.

---

# 10. Job Status

Use:

```text
QUEUED
PROCESSING
GENERATING
VERIFYING
COMPLETED
FAILED
REVIEW_REQUIRED
```

Frontend polls or uses a future WebSocket/SSE mechanism.

For MVP, polling is acceptable.

---

# 11. RBAC

Implement dependency/middleware such as:

```text
require_user()
require_role("reviewer")
require_role("admin")
```

Important:

```text
Frontend permission ≠ security
Backend permission = security
```

---

# 12. Audit Events

Whenever a security/accountability-relevant operation happens, create an audit event.

Example:

```json
{
  "actor_id": "...",
  "actor_role": "reviewer",
  "event_type": "ARTIFACT_APPROVED",
  "resource_type": "artifact",
  "resource_id": "...",
  "request_id": "...",
  "result": "success"
}
```

---

# 13. Redis

Use Redis for:

- job state
- temporary cache
- rate limiting support
- asynchronous processing support

Do not use Redis as the permanent source of truth.

---

# 14. First Vertical Slice

Build:

```text
Login
 ↓
Create Session
 ↓
Upload
 ↓
Create Transformation
 ↓
P1 processes
 ↓
Store result
 ↓
Return artifact
```

Only after that add admin and advanced functionality.

---

# 15. Tests

Test:

- auth
- RBAC
- CRUD
- validation
- status transitions
- unauthorized access
- audit event creation
- AI service failure
- duplicate requests
- artifact retrieval

---

# 16. Definition of Done

Every endpoint must have:

- Pydantic request schema
- Pydantic response schema
- authentication requirement
- authorization requirement
- validation
- error handling
- tests
- OpenAPI documentation
