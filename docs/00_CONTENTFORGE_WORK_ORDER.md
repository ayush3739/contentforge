# ContentForge AI --- Team Work Order

## SIH 2026 --- SIH26154 \| Elite Coders

## Purpose

This document defines the **order in which the five team members should
build ContentForge AI**, what must be completed before another person
depends on it, and the exact handoff boundaries.

The goal is to prevent parallel work from becoming incompatible.

------------------------------------------------------------------------

# 1. Team Ownership

  ------------------------------------------------------------------------
  Person                  Role                     Primary Ownership
  ----------------------- ------------------------ -----------------------
  P1                      AI Engineer              AI intelligence +
                                                   transformation pipeline

  P2                      Frontend Engineer        Next.js/React UI + API
                                                   integration

  P3                      Backend Engineer         FastAPI + DB + public
                                                   APIs + jobs

  P4                      Artifact Engineer        Transformation
                                                   recipes +
                                                   PPTX/PDF/DOCX/SVG
                                                   renderers

  P5                      Cloud/Cyber/Blockchain   Infrastructure +
                                                   storage + security +
                                                   provenance
  ------------------------------------------------------------------------

------------------------------------------------------------------------

# 2. Architecture to Build

``` text
                         USERS
                           │
                           ▼
                   Next.js / React
                         P2
                           │
                      HTTPS / JSON
                           │
                           ▼
                    ┌─────────────┐
                    │   FastAPI   │
                    │     P3      │
                    └──────┬──────┘
                           │
              ┌────────────┼─────────────┐
              │            │             │
              ▼            ▼             ▼
           Auth/RBAC     Jobs          Storage
              │            │             │
              │            ▼             │
              │        P1 AI             │
              │            │              │
              │            ▼              │
              │       Verified JSON       │
              │            │              │
              │            ▼              │
              │          P4               │
              │       Renderer             │
              │            │              │
              └────────────┼──────────────┘
                           ▼
                     Object Storage
                         P5
                           │
                           ▼
                       Artifact
                           │
                           ▼
                        Frontend
```

------------------------------------------------------------------------

# 3. Non-Negotiable Architecture Rules

## Rule 1 --- FastAPI is the application front door

Frontend talks to FastAPI, not directly to:

``` text
LLM
PostgreSQL
Redis
MinIO
Hyperledger
```

------------------------------------------------------------------------

## Rule 2 --- P1 returns structured JSON

``` text
P1 AI
 ↓
Verified renderer-neutral JSON
```

P1 does not own PPTX/PDF binary generation.

------------------------------------------------------------------------

## Rule 3 --- P4 renders artifacts

``` text
AI JSON
 ↓
P4
 ↓
PPTX/PDF/DOCX/SVG/HTML
```

P4 must not silently change factual content.

------------------------------------------------------------------------

## Rule 4 --- Binary artifacts are stored

For:

``` text
PPTX
PDF
DOCX
PNG
SVG
```

use object storage.

Do not store large binaries in PostgreSQL.

Do not use the transformation HTTP response as the permanent file store.

------------------------------------------------------------------------

## Rule 5 --- PostgreSQL is application source of truth

PostgreSQL stores:

``` text
users
sessions
documents metadata
CCO metadata
transformations
artifacts
verification
audit
provenance
```

------------------------------------------------------------------------

## Rule 6 --- Redis is not permanent storage

Redis is for:

``` text
jobs
cache
temporary state
rate limiting
```

------------------------------------------------------------------------

## Rule 7 --- Blockchain stores provenance, not content

Only hashes/minimal provenance go on the permissioned ledger.

Source files and generated files stay off-chain.

------------------------------------------------------------------------

# 4. Phase 0 --- Freeze the Contracts

### P3 + P1 + P2 + P4

Before serious implementation, agree on:

``` text
TransformationRequest
CCO
Evidence
TransformationResponse
VerificationResult
Artifact
ArtifactVersion
```

Create:

``` text
contracts/
├── transformation_request
├── transformation_response
├── cco
├── evidence
├── verification
└── artifact
```

This is the most important cross-team dependency.

------------------------------------------------------------------------

# 5. Phase 1 --- P5 Infrastructure First

P5 prepares:

``` text
PostgreSQL
pgvector
Redis
MinIO/S3
Docker Compose
networking
environment variables
secrets
```

Minimum environment:

``` text
frontend
backend
postgres
redis
minio
```

Exit condition:

> P3 can connect to all required services.

------------------------------------------------------------------------

# 6. Phase 2 --- P3 Backend Foundation

P3 builds:

``` text
FastAPI
PostgreSQL connection
migrations
auth
JWT
RBAC
users
sessions
document metadata
artifact metadata
transformation records
audit logs
```

API skeleton:

``` http
POST /api/v1/auth/login
GET  /api/v1/auth/me

POST /api/v1/sessions
GET  /api/v1/sessions
GET  /api/v1/sessions/{id}

POST /api/v1/sessions/{id}/documents
GET  /api/v1/documents/{id}

POST /api/v1/transformations
GET  /api/v1/transformations/{id}
GET  /api/v1/transformations/{id}/status

GET /api/v1/artifacts/{id}
GET /api/v1/artifacts/{id}/download
```

Exit condition:

> Frontend can call mocked APIs and P1 can submit a transformation
> request.

------------------------------------------------------------------------

# 7. Phase 3 --- P1 AI in Parallel

P1 does not need to wait for the complete FastAPI system.

Start with:

``` text
TXT
 ↓
CCO
 ↓
RAG
 ↓
Executive Summary JSON
 ↓
Verification
```

Then:

``` text
PDF
 ↓
CCO
 ↓
RAG
 ↓
Presentation JSON
 ↓
Verification
```

Use mocked transformation requests if P3's API is not ready.

Exit condition:

> P1 can transform a sample PDF into verified structured JSON.

------------------------------------------------------------------------

# 8. Phase 4 --- P4 Renderer in Parallel

P4 starts with mock AI JSON.

Example:

``` json
{
  "artifact_type": "presentation",
  "title": "Incident Briefing",
  "slides": [
    {
      "slide_number": 1,
      "title": "Executive Overview",
      "body": ["Key finding 1", "Key finding 2"],
      "speaker_notes": "Speaker notes",
      "evidence_refs": ["chunk-001"]
    }
  ]
}
```

P4 builds:

``` text
JSON
 ↓
PPTX
```

Then:

``` text
JSON
 ↓
PDF/DOCX/SVG as required
```

Exit condition:

> A valid PPTX can be generated from the agreed Presentation JSON.

------------------------------------------------------------------------

# 9. Phase 5 --- P2 Frontend in Parallel

P2 builds against API contracts/mocks:

``` text
Login
Dashboard
Session creation
Upload
Processing status
CCO viewer
Evidence viewer
Transformation Planner
Verification
Artifact workspace
Reviewer UI
Admin UI
```

Frontend contains no AI/business logic.

Exit condition:

> User can navigate the complete workflow using mocked backend
> responses.

------------------------------------------------------------------------

# 10. Phase 6 --- First Vertical Slice

This is the first full-team milestone.

``` text
LOGIN
 ↓
CREATE SESSION
 ↓
UPLOAD PDF
 ↓
STORE SOURCE
 ↓
CREATE TRANSFORMATION
 ↓
QUEUE JOB
 ↓
P1 AI
 ↓
CCO + RAG
 ↓
GENERATE VERIFIED JSON
 ↓
P4 RENDER
 ↓
PPTX
 ↓
STORE PPTX
 ↓
ARTIFACT RECORD
 ↓
FRONTEND PREVIEW
 ↓
DOWNLOAD
```

Do not prioritize advanced features before this works.

------------------------------------------------------------------------

# 11. Exact PPT Workflow

## User action

Frontend sends:

``` http
POST /api/v1/transformations
```

with transformation parameters.

## P3 Backend

``` text
authenticate
 ↓
RBAC
 ↓
validate
 ↓
create TR-001
 ↓
queue job
 ↓
return:
{
  "transformation_id": "TR-001",
  "status": "QUEUED"
}
```

## P1 AI

``` text
load source
 ↓
understand
 ↓
CCO
 ↓
retrieve evidence
 ↓
plan presentation
 ↓
generate Presentation JSON
 ↓
verify
 ↓
return verified Presentation JSON
```

## P4 Renderer

``` text
Presentation JSON
 ↓
PPTX renderer
 ↓
presentation.pptx
```

## Storage

``` text
presentation.pptx
 ↓
MinIO/S3
```

PostgreSQL records:

``` text
artifact_id
version
storage_key
mime_type
checksum
status
```

## Frontend

Gets artifact metadata and uses:

``` text
Preview
+
Download
```

The PPTX is persisted before normal download/serving.

------------------------------------------------------------------------

# 12. Why PPTX Is Stored

The transformation request should return:

``` text
ID + status
```

not a large PPTX binary.

Persistent artifact storage supports:

``` text
re-download
versioning
approval
audit
provenance
backup
retry
artifact history
```

The download endpoint can stream the file or provide a short-lived
signed object-storage URL.

------------------------------------------------------------------------

# 13. Handoff Matrix

  Handoff                  Provider   Receiver   Required
  ------------------------ ---------- ---------- --------------------------------
  DB connection            P5         P3         Before DB work
  Redis                    P5         P3         Before jobs
  Object storage           P5         P3/P4      Before file workflow
  API contracts            P3         P1/P2/P4   Before integration
  Transformation request   P3         P1         Before AI integration
  CCO schema               P1         P2/P3/P4   Before visualization/rendering
  Evidence schema          P1         P2/P3      Before evidence UI
  Verification schema      P1         P2/P3      Before verification UI
  Presentation JSON        P1         P4         Before PPT integration
  PPTX artifact            P4         P3/P2      Before final artifact UI
  Artifact metadata        P3         P2/P5      Before download/provenance
  Provenance record        P5         P3/P2      Before provenance UI

------------------------------------------------------------------------

# 14. P1 → P3 Contract

P1 needs:

``` text
transformation_id
session_id
document_id
document_version_id
source access
output_types
audience
tone
language
detail_level
objective
style
```

P1 returns:

``` text
cco_version
structured outputs
verification result
evidence references
issues
```

------------------------------------------------------------------------

# 15. P3 → P2 Contract

P2 needs stable:

``` text
auth
session
document
transformation
status
artifact
verification
review
admin
provenance
```

FastAPI OpenAPI is the contract source.

------------------------------------------------------------------------

# 16. P1 → P4 Contract

P1 returns renderer-neutral JSON.

P1 decides:

``` text
facts
claims
messaging
structure
evidence references
```

P4 decides:

``` text
layout
fonts
positions
theme
visual hierarchy
charts
```

P4 does not silently alter factual content.

------------------------------------------------------------------------

# 17. Work Order --- Detailed Sequence

## STEP 1 --- P5

``` text
PostgreSQL
pgvector
Redis
MinIO
Docker
Secrets
```

### Exit condition

P3 can connect to all services.

------------------------------------------------------------------------

## STEP 2 --- P3

``` text
FastAPI
DB models
migrations
Auth
RBAC
Session API
Document API
Transformation API
Artifact API
```

### Exit condition

Frontend can call mocked APIs and P1 can call the agreed transformation
interface.

------------------------------------------------------------------------

## STEP 3 --- P1

``` text
CCO
RAG
Executive Summary
Verification
Presentation JSON
```

### Exit condition

P1 can transform a sample PDF into verified structured JSON.

------------------------------------------------------------------------

## STEP 4 --- P4

``` text
Presentation JSON
 ↓
PPTX
```

### Exit condition

A valid PPTX can be generated from mock and real P1 JSON.

------------------------------------------------------------------------

## STEP 5 --- P2

``` text
Frontend
 ↓
Transformation API
 ↓
Status
 ↓
Artifact
 ↓
Preview/download
```

### Exit condition

User can complete the vertical slice through UI.

------------------------------------------------------------------------

## STEP 6 --- P3 + P4 + P5

Connect:

``` text
PPTX
 ↓
Object Storage
 ↓
Artifact DB
 ↓
Download API
```

### Exit condition

Generated PPTX persists and remains downloadable after browser refresh.

------------------------------------------------------------------------

## STEP 7 --- P5

Add:

``` text
SHA-256
 ↓
Hyperledger
 ↓
Tamper verification
```

### Exit condition

Artifact tampering can be demonstrated.

------------------------------------------------------------------------

# 18. MVP Priority

## P0 --- Must Work

``` text
Login
Session
PDF upload
CCO
Evidence/RAG
Executive Summary
Advisory
Presentation
Verification
Reviewer approval
PPTX download
Provenance
RBAC
```

## P1 --- Strong Additions

``` text
Infographic
Video storyboard
Social output
Artifact version comparison
Admin audit viewer
Security event viewer
```

## P2 --- Optional

``` text
MP4
advanced analytics
WebSockets
advanced editing
```

------------------------------------------------------------------------

# 19. Shared Code Rule

Recommended ownership:

``` text
backend/     → P3
ai/          → P1
frontend/    → P2
renderers/   → P4
infra/       → P5
contracts/   → shared, jointly agreed
```

Avoid four people editing the same application file.

------------------------------------------------------------------------

# 20. Integration Checkpoints

### Checkpoint A

``` text
P5 → P3
Infrastructure works
```

### Checkpoint B

``` text
P3 → P1/P2/P4
Contracts frozen
```

### Checkpoint C

``` text
P1 → P4
Presentation JSON works
```

### Checkpoint D

``` text
P4 → P3
PPTX artifact works
```

### Checkpoint E

``` text
P3 → P2
Full frontend flow works
```

### Checkpoint F

``` text
P5 → whole team
Provenance/security demo works
```

------------------------------------------------------------------------

# 21. Final End-to-End Definition of Done

``` text
                    SOURCE
                      ↓
                  INGESTION
                      ↓
                     CCO
                      ↓
                 EVIDENCE/RAG
                      ↓
              TRANSFORMATION PLAN
                      ↓
                 LLM GENERATION
                      ↓
                 VERIFICATION
                      ↓
                HUMAN REVIEW
                      ↓
               VERIFIED ARTIFACT
                      ↓
              ┌───────┼────────┐
              ↓       ↓        ↓
             PPTX    PDF      DOCX
              ↓       ↓        ↓
                 OBJECT STORAGE
                      ↓
                   ARTIFACT
                      ↓
                SHA-256 HASH
                      ↓
              PERMISSIONED LEDGER
```

Judge-facing story:

> **One trusted source representation → multiple audience-specific
> outputs → evidence-backed verification → human approval → persistent
> artifacts → tamper-evident provenance.**

------------------------------------------------------------------------

# 22. Immediate Action List

## P5 --- Start now

``` text
[ ] PostgreSQL
[ ] pgvector
[ ] Redis
[ ] MinIO/S3
[ ] Docker Compose
[ ] .env.example
[ ] secrets strategy
[ ] network isolation
[ ] backups
```

## P3 --- Start now

``` text
[ ] FastAPI skeleton
[ ] PostgreSQL connection
[ ] migrations
[ ] Auth/JWT
[ ] RBAC
[ ] Session model/API
[ ] Document model/API
[ ] Transformation model/API
[ ] Artifact model/API
[ ] Redis job skeleton
[ ] Object storage integration
[ ] Audit logging
```

## P1 --- Start now in parallel

``` text
[ ] Shared CCO schema
[ ] Text → CCO
[ ] PDF → CCO
[ ] Chunking
[ ] Embeddings
[ ] pgvector retrieval
[ ] Transformation planner
[ ] Prompt compiler
[ ] Structured generation
[ ] Verification
[ ] Presentation JSON
```

## P4 --- Start with mock JSON

``` text
[ ] Presentation schema integration
[ ] PPTX renderer
[ ] PDF/DOCX renderer
[ ] Artifact preview generation
[ ] Renderer tests
```

## P2 --- Start with API mocks

``` text
[ ] Login
[ ] Dashboard
[ ] Sessions
[ ] Upload
[ ] CCO viewer
[ ] Evidence viewer
[ ] Transformation Planner
[ ] Generation status
[ ] Verification UI
[ ] Artifact workspace
[ ] PPTX preview/download
```

------------------------------------------------------------------------

# 23. Final Ownership Principle

``` text
P5 = Make the environment reliable and secure
P3 = Make the application/API reliable
P1 = Make the intelligence reliable
P4 = Make the outputs render correctly
P2 = Make the product usable
```

No person should silently take over another person's core ownership.

Shared product pipeline:

``` text
SOURCE
  ↓
UNDERSTAND
  ↓
CCO + EVIDENCE
  ↓
TRANSFORM
  ↓
VERIFY
  ↓
REVIEW
  ↓
ARTIFACT
  ↓
PROVENANCE
```
