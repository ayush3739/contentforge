# Person 3 --- Backend / API + Database Engineer

## Owner: FastAPI Application Layer + Persistence + Job Orchestration

**Project:** ContentForge AI\
**SIH:** 2026 --- SIH26154\
**Team:** Elite Coders\
**Backend:** FastAPI\
**Database:** PostgreSQL + pgvector\
**Object storage:** MinIO/S3-compatible\
**Async infrastructure:** Redis

------------------------------------------------------------------------

## 1. Mission

Build the application backend connecting:

``` text
Frontend
   ↕
FastAPI
   ↕
AI Engine
   ↕
Artifact Engine
   ↕
Storage / Provenance Infrastructure
```

You own **public application APIs, persistence,
authentication/authorization, business state and job orchestration**.

P1 owns AI intelligence. P4 owns binary artifact rendering. P5 owns
infrastructure/deployment/security infrastructure.

------------------------------------------------------------------------

## 2. Core Ownership

You own:

``` text
FastAPI
API routing
Pydantic schemas
authentication
RBAC enforcement
users/roles
sessions
document metadata
document versions
transformation records
artifact metadata
verification records
job orchestration
audit persistence
storage API integration
API error handling
OpenAPI documentation
```

You do NOT own:

``` text
LLM prompts
CCO extraction logic
RAG strategy
AI verification logic
React UI
PPTX rendering
Hyperledger implementation
Docker infrastructure ownership
```

Do not put AI logic directly inside route handlers.

------------------------------------------------------------------------

## 3. Backend Structure

``` text
backend/
├── app/
│   ├── api/v1/
│   ├── auth/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── jobs/
│   ├── storage/
│   ├── audit/
│   └── main.py
├── migrations/
└── tests/
```

Recommended services:

``` text
auth_service
session_service
document_service
transformation_service
artifact_service
storage_service
audit_service
job_service
```

------------------------------------------------------------------------

## 4. API Versioning

Use:

``` text
/api/v1/...
```

from the beginning.

------------------------------------------------------------------------

## 5. Authentication APIs

``` http
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

Current-user example:

``` json
{
  "user_id": "USR-001",
  "username": "analyst01",
  "role": "analyst",
  "permissions": []
}
```

------------------------------------------------------------------------

## 6. RBAC

Roles:

``` text
analyst
reviewer
admin
```

Use dependencies such as:

``` python
require_user()
require_role("reviewer")
require_role("admin")
```

Permission matrix:

  Operation             Analyst   Reviewer   Admin
  ------------------- --------- ---------- -------
  Create session              ✓          ✓       ✓
  Upload source               ✓          ✓       ✓
  Generate                    ✓          ✓       ✓
  View verification           ✓          ✓       ✓
  Approve/reject            ---          ✓       ✓
  Manage users              ---        ---       ✓
  Manage roles              ---        ---       ✓
  System audit              ---        ---       ✓
  System config             ---        ---       ✓

> Frontend permission is UX. Backend permission is security.

------------------------------------------------------------------------

## 7. Session APIs

``` http
POST   /api/v1/sessions
GET    /api/v1/sessions
GET    /api/v1/sessions/{id}
PATCH  /api/v1/sessions/{id}
DELETE /api/v1/sessions/{id}
```

A session stores application state and references documents/artifacts.
It is not the AI semantic memory.

------------------------------------------------------------------------

## 8. Document APIs

``` http
POST /api/v1/sessions/{id}/documents
GET  /api/v1/documents/{id}
GET  /api/v1/documents/{id}/versions
GET  /api/v1/documents/{id}/download
GET  /api/v1/documents/{id}/cco
GET  /api/v1/documents/{id}/evidence
```

Upload flow:

``` text
Frontend
 ↓
FastAPI
 ↓
MIME/type/size validation
 ↓
Object Storage
 ↓
Document metadata in PostgreSQL
 ↓
Queue understanding job
 ↓
P1 AI
```

Do not put PDF/DOCX/PPTX binaries into PostgreSQL.

------------------------------------------------------------------------

## 9. Database

Use:

``` text
PostgreSQL
+
pgvector
```

Core tables:

``` text
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

Use migrations. Never rely on manual production schema edits.

------------------------------------------------------------------------

## 10. JSONB

Use JSONB for semi-structured content:

``` text
cco_json
issues_json
metadata_json
structured_content_json
verification_json
```

Keep important identifiers relational:

``` text
id
session_id
document_id
version
artifact_id
status
created_at
```

------------------------------------------------------------------------

## 11. Object Storage

Actual binary files go to:

``` text
MinIO / S3-compatible object storage
```

PostgreSQL stores:

``` text
storage_key
mime_type
checksum
size
```

Example:

``` text
artifact_id = ART-001
type = presentation
version = 2
storage_key = artifacts/TR-001/presentation/v2/presentation.pptx
checksum = sha256:...
status = verified
```

------------------------------------------------------------------------

## 12. Artifact Storage Decision

For:

``` text
PPTX
PDF
DOCX
SVG
PNG
```

**Store the generated file first.**

Do not normally send the binary as the response to the long-running
transformation request.

Preferred:

``` text
AI JSON
 ↓
P4 Renderer
 ↓
PPTX
 ↓
Object Storage
 ↓
Artifact metadata in PostgreSQL
 ↓
Frontend
 ↓
Download endpoint / signed URL
```

Transformation request returns status/IDs:

``` json
{
  "transformation_id": "TR-001",
  "status": "QUEUED"
}
```

Artifact response later:

``` json
{
  "artifact_id": "ART-001",
  "type": "presentation",
  "version": 1,
  "status": "verified",
  "filename": "incident_briefing.pptx",
  "download_url": "/api/v1/artifacts/ART-001/download"
}
```

Small structured text outputs may be returned as JSON, but persistent
artifact records should still be created for
versioning/audit/provenance.

------------------------------------------------------------------------

## 13. Transformation API

``` http
POST /api/v1/transformations
GET  /api/v1/transformations/{id}
GET  /api/v1/transformations/{id}/status
```

Request:

``` json
{
  "session_id": "SES-001",
  "source_document_id": "DOC-001",
  "output_types": ["executive_summary", "presentation"],
  "audience": "senior leadership",
  "tone": "professional",
  "language": "English",
  "detail_level": "concise",
  "objective": "decision briefing",
  "style": "formal"
}
```

Backend validates and creates a transformation record.

------------------------------------------------------------------------

## 14. Transformation Orchestration

Never run a long LLM process directly inside the HTTP request.

Preferred:

``` text
POST /transformations
       ↓
authenticate
       ↓
RBAC
       ↓
validate
       ↓
create transformation record
       ↓
queue job
       ↓
return 202 / queued
```

Worker:

``` text
Job
 ↓
P1 AI
 ↓
P4 renderer
 ↓
verification
 ↓
artifact storage
 ↓
update DB
```

------------------------------------------------------------------------

## 15. Job State

Use:

``` text
QUEUED
PROCESSING
GENERATING
VERIFYING
RENDERING
COMPLETED
FAILED
REVIEW_REQUIRED
```

For MVP, frontend polling is acceptable:

``` http
GET /api/v1/transformations/{id}/status
```

Future:

``` text
SSE / WebSocket
```

------------------------------------------------------------------------

## 16. Redis

Use Redis for:

``` text
job queue/state
temporary cache
rate limiting support
ephemeral coordination
```

Redis is not the permanent source of truth. PostgreSQL is authoritative.

------------------------------------------------------------------------

## 17. P1 AI Integration Contract

MVP can keep AI in the same Python/FastAPI deployment:

``` python
ai_engine.transform(request)
```

Later:

``` text
FastAPI Application
       │
       │ internal HTTP
       ▼
AI FastAPI Service
```

The frontend must not care which arrangement is used.

------------------------------------------------------------------------

## 18. AI Result Contract

P1 returns:

``` json
{
  "transformation_id": "TR-001",
  "cco_version": 3,
  "outputs": [
    {
      "artifact_type": "presentation",
      "content": {}
    }
  ],
  "verification": {
    "status": "passed",
    "grounding_score": 0.94,
    "unsupported_claims": []
  }
}
```

Backend stores the structured result and passes the appropriate content
to P4.

------------------------------------------------------------------------

## 19. P4 Renderer Integration

P4 receives:

``` text
verified structured AI JSON
```

P4 produces:

``` text
PPTX
PDF
DOCX
SVG
HTML
```

Backend then:

``` text
receive generated file
 ↓
calculate/record checksum
 ↓
store object
 ↓
create artifact version
 ↓
update transformation status
```

P3 must not silently rewrite factual content.

------------------------------------------------------------------------

## 20. Artifact APIs

``` http
GET  /api/v1/artifacts/{id}
GET  /api/v1/artifacts/{id}/versions
GET  /api/v1/artifacts/{id}/download
GET  /api/v1/artifacts/{id}/verification
POST /api/v1/artifacts/{id}/verify
POST /api/v1/artifacts/{id}/revise
POST /api/v1/artifacts/{id}/finalize
```

Download may use FastAPI streaming or a short-lived signed
object-storage URL.

------------------------------------------------------------------------

## 21. Review APIs

``` http
GET  /api/v1/review
POST /api/v1/artifacts/{id}/finalize
POST /api/v1/artifacts/{id}/revise
```

Reviewer actions must create audit records.

------------------------------------------------------------------------

## 22. Admin APIs

``` http
GET   /api/v1/admin/users
POST  /api/v1/admin/users
PATCH /api/v1/admin/users/{id}
PATCH /api/v1/admin/users/{id}/roles

GET /api/v1/admin/audit-logs
GET /api/v1/admin/security-events
```

------------------------------------------------------------------------

## 23. Audit Logging

Example:

``` json
{
  "actor_id": "USR-001",
  "actor_role": "reviewer",
  "event_type": "ARTIFACT_APPROVED",
  "resource_type": "artifact",
  "resource_id": "ART-001",
  "timestamp": "...",
  "request_id": "REQ-001",
  "result": "success",
  "metadata": {}
}
```

Important events:

``` text
LOGIN
LOGIN_FAILED
UPLOAD
DELETE
SESSION_CREATED
CCO_CREATED
TRANSFORMATION_STARTED
TRANSFORMATION_COMPLETED
ARTIFACT_CREATED
ARTIFACT_APPROVED
ARTIFACT_REJECTED
ARTIFACT_REVISED
USER_CREATED
ROLE_CHANGED
CONFIG_CHANGED
PROVENANCE_ANCHORED
```

Audit records should be append-oriented.

------------------------------------------------------------------------

## 24. Security Events

Persist events such as:

``` text
PROMPT_INJECTION_DETECTED
MALICIOUS_FILE_DETECTED
UNAUTHORIZED_ACCESS
INVALID_TOKEN
RATE_LIMIT_EXCEEDED
OUTPUT_VALIDATION_FAILED
SUSPICIOUS_REQUEST
HASH_MISMATCH
```

P1 may emit AI-level events; P3 persists them.

------------------------------------------------------------------------

## 25. API Error Contract

Use a predictable format:

``` json
{
  "error": {
    "code": "TRANSFORMATION_NOT_FOUND",
    "message": "Transformation does not exist.",
    "request_id": "REQ-001"
  }
}
```

Never expose internal stack traces.

------------------------------------------------------------------------

## 26. Shared API Contract Package

Maintain stable schemas for:

``` text
auth
session
document
cco
evidence
transformation
verification
artifact
```

Use Pydantic models as the source of truth for FastAPI OpenAPI.

P1, P2 and P4 consume these contracts instead of inventing their own
shapes.

------------------------------------------------------------------------

## 27. What Must Be Ready Before P1 Serious Integration

Minimum:

``` text
✓ FastAPI project runs
✓ PostgreSQL connection works
✓ pgvector enabled
✓ migrations run
✓ object storage reachable
✓ Redis reachable
✓ auth works
✓ RBAC dependency works
✓ sessions API works
✓ document metadata API works
✓ transformation request schema is frozen
✓ transformation record exists
✓ job can be queued
✓ AI can receive a transformation request
✓ artifact metadata schema exists
✓ download endpoint exists
✓ audit logging works
```

P1 can use local fixtures before all of these are complete.

------------------------------------------------------------------------

## 28. First Vertical Slice

Make this work first:

``` text
Login
 ↓
Create Session
 ↓
Upload PDF
 ↓
Store PDF in object storage
 ↓
Create transformation
 ↓
Queue job
 ↓
P1 processes
 ↓
P1 returns verified JSON
 ↓
P4 renders PPTX
 ↓
Store PPTX
 ↓
Create Artifact record
 ↓
Frontend retrieves artifact
 ↓
Download PPTX
```

Only after this works should advanced admin/analytics features be
prioritized.

------------------------------------------------------------------------

## 29. Tests

Cover:

``` text
authentication
RBAC
CRUD
request validation
status transitions
unauthorized access
audit creation
AI failure
renderer failure
storage failure
duplicate requests
artifact retrieval
download authorization
versioning
```

Also test that duplicate transformation requests cannot accidentally
create duplicate artifacts.

------------------------------------------------------------------------

## 30. Definition of Done

Backend is ready when:

``` text
Frontend
   ↓
FastAPI
   ↓
Auth/RBAC
   ↓
Session
   ↓
Document
   ↓
Transformation Job
   ↓
P1 AI
   ↓
P4 Renderer
   ↓
Object Storage
   ↓
Artifact Metadata
   ↓
Download
```

works through stable documented APIs.

------------------------------------------------------------------------

## 31. Key Principle

> **FastAPI is the application's front door and source of application
> truth. P1 supplies intelligence; P4 supplies rendered artifacts; P5
> supplies secure infrastructure.**
