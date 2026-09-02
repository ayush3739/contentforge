# ContentForge AI — Team Integration Contract
## SIH26154 | Shared Engineering Contract | Version 1.0

> **Purpose:** This is the common contract for all five developers. Read this before implementing any module. Individual work files must follow the interfaces, entities, statuses, and ownership boundaries defined here.

---

## 1. Product in One Sentence

**ContentForge AI** converts one source into multiple trustworthy communication artefacts by understanding the source once, creating a versioned Canonical Content Object (CCO), retrieving supporting evidence, applying an operator-selected transformation plan, generating structured content, verifying it, and delivering versioned artefacts with provenance.

The architecture deliberately separates:
- **CCO** = semantic source of truth
- **RAG/evidence index** = retrieval memory
- **Session state** = application/workspace memory
- **Artifacts** = generated products
- **LLM** = replaceable transformation engine

---

## 2. Five-Person Ownership

| Person | Primary ownership | Must understand |
|---|---|---|
| P1 — AI Engineer | AI pipeline from source/prompt through final verified content | Entire system + all AI contracts |
| P2 — Frontend Engineer | Operator UI, review UI, admin UI | APIs, data models, frontend structure |
| P3 — Backend/API Engineer | FastAPI application APIs, DB models, jobs, persistence | APIs, DB, frontend data needs |
| P4 — Output Full-stack Engineer | Transformation recipes, renderers, artifact preview/export | AI output schema, APIs, frontend artifact flow |
| P5 — Cloud/Cyber/Blockchain Engineer | Infra, secrets, security controls, audit, provenance ledger | APIs, auth/RBAC, deployment, security |

### Ownership rule

A person may help another person, but **the owner remains responsible for the final interface and tests**.

---

# 3. System Architecture

```text
                         ┌─────────────────────┐
                         │      FRONTEND       │
                         │       P2            │
                         │ React / Next.js     │
                         └──────────┬──────────┘
                                    │ HTTPS/JSON
                                    ▼
                         ┌─────────────────────┐
                         │    CORE BACKEND     │
                         │       P3            │
                         │ FastAPI             │
                         │ Auth / Sessions     │
                         │ Documents / Jobs    │
                         └──────┬──────┬───────┘
                                │      │
                    ┌───────────┘      └────────────┐
                    ▼                              ▼
          ┌──────────────────┐            ┌──────────────────┐
          │    AI PIPELINE   │            │ ARTIFACT ENGINE   │
          │       P1         │            │       P4          │
          │                  │            │                  │
          │ Understand       │            │ Recipes          │
          │ CCO              │            │ PPTX             │
          │ RAG              │            │ DOCX             │
          │ Planner          │            │ PDF/HTML         │
          │ Prompt compiler  │            │ Preview/export   │
          │ Generation       │            │                  │
          │ Verification     │            │                  │
          └────────┬─────────┘            └────────┬─────────┘
                   │                               │
                   └──────────────┬────────────────┘
                                  ▼
                  ┌──────────────────────────────────┐
                  │            DATA LAYER             │
                  │ PostgreSQL + pgvector             │
                  │ Object Storage                    │
                  │ Redis                             │
                  └────────────────┬─────────────────┘
                                   │
                       ┌───────────┴───────────┐
                       ▼                       ▼
             ┌──────────────────┐    ┌──────────────────┐
             │ SECURITY / AUDIT │    │ PROVENANCE       │
             │       P5         │    │ Hyperledger      │
             │ RBAC / logging   │    │ finalized hashes │
             └──────────────────┘    └──────────────────┘
```

---

# 4. Shared Technology Baseline

## Application

- Frontend: React / Next.js
- Backend: Python + FastAPI
- AI services: Python
- Database: PostgreSQL
- Vector search: pgvector initially
- Object storage: S3-compatible storage / Supabase Storage for hackathon
- Job/cache: Redis
- API contract: OpenAPI
- Authentication: JWT/OAuth2-compatible flow
- Containers: Docker for reproducible local/deployment environments
- Blockchain: Hyperledger Fabric as the target provenance layer

### Important

**Docker is not the shared database.**

All developers use the same development PostgreSQL instance/connection. Docker may run application services locally, but persistent shared development state should be in the agreed shared database.

---

# 5. Shared Development Environment

Every developer must have:

```text
Git repository
Python environment
Node.js environment
PostgreSQL connection
Object-storage connection
Redis connection
LLM provider credentials (where needed)
.env file
API documentation
```

Recommended hackathon setup:

```text
Shared PostgreSQL + pgvector
Shared object storage
Shared Redis
```

For real sensitive deployment, move the data layer on-premise. The hackathon database must use mock/non-sensitive data.

## `.env.example`

```env
APP_ENV=development
APP_NAME=contentforge

DATABASE_URL=
REDIS_URL=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

JWT_SECRET=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

LLM_PROVIDER=
LLM_API_KEY=
LLM_MODEL=

EMBEDDING_MODEL=
VECTOR_DIMENSION=

BLOCKCHAIN_NETWORK=
BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_CONTRACT_ID=

LOG_LEVEL=INFO
```

Never commit `.env`.

---

# 6. Database Responsibility

PostgreSQL is the system-of-record database.

## Core tables

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

### Storage rule

- PostgreSQL: metadata, relationships, structured CCO, requests, statuses, audit records
- pgvector: embeddings associated with evidence chunks
- Object storage: source files and generated files
- Redis: temporary cache, job state, queue support
- Blockchain: finalized provenance/hash records only

Do not store complete PDFs/DOCX/video files in PostgreSQL.

---

# 7. Core Data Model

## User

```text
id
name
email
status
created_at
updated_at
```

## Role

```text
id
name
```

Roles:

```text
analyst
reviewer
admin
```

## Session

A persistent transformation workspace.

```text
id
name
created_by
status
created_at
updated_at
```

## Document

Logical source document.

```text
id
session_id
name
mime_type
created_by
created_at
```

## DocumentVersion

Immutable version of a source.

```text
id
document_id
version_number
storage_key
checksum
status
created_at
```

## CCOVersion

```text
id
document_version_id
version_number
cco_json
status
created_by
created_at
```

CCO should contain references to source evidence:

```json
{
  "document_id": "...",
  "version": 3,
  "metadata": {},
  "sections": [],
  "entities": [],
  "claims": [],
  "facts": [],
  "dates": [],
  "numbers": [],
  "tables": [],
  "evidence_refs": [],
  "confidence": {}
}
```

## TransformationRequest

```text
id
session_id
cco_version_id
requested_by
output_types
audience
tone
language
detail_level
objective
style
status
created_at
```

## Artifact

```text
id
transformation_request_id
type
status
cco_version_id
content_json
storage_key
checksum
created_at
updated_at
```

## VerificationResult

```text
id
artifact_id
status
grounding_score
unsupported_claim_count
consistency_score
issues_json
created_at
```

## ProvenanceRecord

```text
id
artifact_id
cco_version_id
artifact_hash
verification_hash
ledger_tx_id
anchored_at
```

---

# 8. API Contract

All APIs use JSON unless explicitly returning a file.

Base:

```text
/api/v1
```

## Authentication

```http
POST /auth/login
GET  /auth/me
POST /auth/logout
```

## Sessions

```http
POST /sessions
GET  /sessions
GET  /sessions/{session_id}
PATCH /sessions/{session_id}
```

## Documents

```http
POST /sessions/{session_id}/documents
GET  /documents/{document_id}
GET  /documents/{document_id}/versions
GET  /documents/{document_id}/cco
GET  /documents/{document_id}/evidence
```

## AI / Transformation

```http
POST /transformations
GET  /transformations/{transformation_id}
POST /transformations/{transformation_id}/generate
GET  /transformations/{transformation_id}/status
```

The backend owns the public application endpoint; P1 owns the AI service behind it.

## Artifacts

```http
GET  /artifacts/{artifact_id}
GET  /artifacts/{artifact_id}/versions
GET  /artifacts/{artifact_id}/download
POST /artifacts/{artifact_id}/finalize
```

## Verification

```http
GET  /artifacts/{artifact_id}/verification
POST /artifacts/{artifact_id}/verify
POST /artifacts/{artifact_id}/revise
```

## Admin

```http
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/{user_id}
PATCH  /admin/users/{user_id}/roles

GET    /admin/audit-logs
GET    /admin/security-events
GET    /admin/config
```

## Provenance

```http
GET  /provenance/{artifact_id}
POST /provenance/{artifact_id}/anchor
POST /provenance/{artifact_id}/verify
```

---

# 9. AI Contract

P1's internal AI pipeline should conceptually expose:

```text
understand(source)
build_cco(understanding)
retrieve(evidence_query, session)
plan(transformation_request, cco)
compile_prompt(plan, evidence, cco)
generate(prompt, schema)
verify(artifact, cco, evidence)
revise(artifact, verification_feedback)
transform(request)
```

The preferred high-level call is:

```text
transform(request)
```

which orchestrates the complete pipeline.

### AI response

```json
{
  "transformation_id": "TR-123",
  "cco_version": 3,
  "outputs": [
    {
      "artifact_type": "executive_summary",
      "status": "verified",
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

P4 must consume the structured content rather than inventing or rewriting facts.

---

# 10. Transformation Parameters

The operator can provide:

```text
output_types
audience
tone
language
detail_level
objective
style
```

These parameters are part of the TransformationRequest and are preserved for reproducibility.

---

# 11. Output Types

MVP should prioritize 2–4 strong outputs.

Recommended first:

1. Executive Summary
2. LinkedIn/X Post
3. Advisory
4. Presentation

Then add:

5. Infographic specification
6. Video package

The video output is a package containing script, storyboard, scene descriptions, narration, subtitles and visual recommendations; it does not require an MP4 in the core MVP.

---

# 12. RBAC

## Analyst

Can:

- create sessions
- upload sources
- run transformations
- view CCO/evidence
- view generated artifacts
- submit artifacts for review

## Reviewer

Analyst permissions plus:

- inspect verification
- approve/reject artifacts
- request revision
- inspect evidence
- compare versions

## Admin

Reviewer permissions plus:

- manage users
- assign roles
- manage templates
- inspect all audit logs
- inspect security events
- manage system configuration
- manage model configuration
- manage retention/access policies

### Enforcement

RBAC must be enforced server-side. Hiding a frontend button is not security.

---

# 13. Audit Logging

Audit logs are separate from developer/application logs.

Record:

```text
actor_id
actor_role
event_type
resource_type
resource_id
timestamp
request_id
result
metadata
```

Important events:

```text
LOGIN
LOGIN_FAILED
FILE_UPLOADED
FILE_DELETED
CCO_CREATED
CCO_VERSION_CREATED
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

Audit records must be append-oriented and should not be editable through ordinary application APIs.

---

# 14. Security Events

Separate security events include:

```text
PROMPT_INJECTION_DETECTED
MALICIOUS_FILE_DETECTED
UNAUTHORIZED_ACCESS
INVALID_TOKEN
RATE_LIMIT_EXCEEDED
SUSPICIOUS_REQUEST
OUTPUT_VALIDATION_FAILED
```

P5 owns the security infrastructure. P1 owns AI-level detection/mitigation logic.

---

# 15. Prompt Injection Boundary

Uploaded source material is **untrusted data**.

A document saying:

```text
"Ignore previous instructions..."
```

must be treated as content, not as an instruction to the model.

P1 should separate:

```text
SYSTEM INSTRUCTIONS
OPERATOR PARAMETERS
TRUSTED CCO/EVIDENCE
UNTRUSTED SOURCE CONTENT
```

The source must never be allowed to override system or operator instructions.

---

# 16. Artifact Lifecycle

```text
REQUESTED
   ↓
PROCESSING
   ↓
GENERATED
   ↓
VERIFYING
   ↓
   ├── PASSED → REVIEW/FINALIZED
   │
   └── FAILED → REVISION → VERIFYING
```

A finalized artifact should have:

```text
CCO version
transformation parameters
artifact checksum
verification result
provenance record
```

---

# 17. Git Structure

Recommended repository:

```text
contentforge/
├── frontend/
├── backend/
├── ai/
├── workers/
├── templates/
├── infrastructure/
├── blockchain/
├── docs/
└── tests/
```

Ownership:

```text
frontend/         → P2
backend/          → P3
ai/               → P1
workers/          → P3 + P1 integration
templates/        → P4
infrastructure/   → P5
blockchain/       → P5
docs/             → shared
tests/             → shared ownership
```

---

# 18. Git Rules

Branches:

```text
main
develop
feature/p1-...
feature/p2-...
feature/p3-...
feature/p4-...
feature/p5-...
```

Do not directly push unfinished work to `main`.

Every API/schema change must update:

```text
OpenAPI
shared schema/model
docs
tests
```

---

# 19. Integration Sequence

## Phase 1 — Contract

All five agree on:

- DB schema
- API routes
- request/response schemas
- status values
- authentication
- RBAC
- folder structure

## Phase 2 — Skeleton

P1: AI package skeleton  
P2: frontend shell  
P3: FastAPI + DB  
P4: artifact engine skeleton  
P5: security/config/infra skeleton

## Phase 3 — First Vertical Slice

```text
Login
 ↓
Create Session
 ↓
Upload PDF
 ↓
Process
 ↓
CCO
 ↓
Generate Executive Summary
 ↓
Verify
 ↓
Show result
```

Only after this works should the team add additional outputs.

---

# 20. Definition of "Done"

A feature is not done when the local code works.

It is done when:

- API contract is stable
- validation exists
- errors are handled
- database state is persisted where required
- frontend integration works where applicable
- tests exist
- logs/audit behavior is defined
- README/docs are updated
- another teammate can run it

---

# 21. Non-Negotiable Architecture Principles

1. **One source, one canonical understanding.**
2. **All outputs reference a CCO version.**
3. **RAG retrieves evidence; it is not the source of truth.**
4. **The LLM does not directly control application actions.**
5. **Structured generation is preferred over free-form output.**
6. **Generated claims must be verifiable against evidence.**
7. **Uploaded content is untrusted.**
8. **RBAC is enforced server-side.**
9. **Audit logs are separate from normal application logs.**
10. **Source/artifact files remain off-chain.**
11. **Only provenance hashes/metadata go to the ledger.**
12. **No person creates a parallel API/database model without team agreement.**
13. **P1 owns AI logic; P3 owns public application APIs.**
14. **P4 renders AI-produced structured content; it does not silently rewrite facts.**
15. **The architecture must remain deployable on-premise for the target organization.**
