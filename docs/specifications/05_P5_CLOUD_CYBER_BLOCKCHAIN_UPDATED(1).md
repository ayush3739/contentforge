# Person 5 --- Cloud + Cybersecurity + Blockchain Engineer

## Owner: Infrastructure, Storage, Deployment, Security Infrastructure & Provenance

**Project:** ContentForge AI\
**SIH:** 2026 --- SIH26154\
**Team:** Elite Coders\
**Application backend:** FastAPI

------------------------------------------------------------------------

## 1. Mission

Prepare the infrastructure and shared service APIs that allow P1, P2, P3, and P4 to build against reliable shared cloud services.

Immediate P0 priority:

``` text
1. Shared PostgreSQL + pgvector API (Neon DB / Supabase)
2. Shared Redis Queue & Cache API (Upstash Redis)
3. Shared S3-Compatible Object Storage (Supabase Storage / Cloudflare R2 / AWS S3)
4. Environment variable & secrets distribution (.env)
5. Docker Compose (Local / Offline fallback)
6. Security controls & audit logging
7. Monitoring & logging
```

Blockchain/provenance comes after the core application path works.

------------------------------------------------------------------------

## 2. Final Infrastructure Architecture

``` text
Internet / Operator
        ↓
HTTPS / Reverse Proxy
        ↓
FastAPI
   ┌────┼───────────────┐
   ↓    ↓               ↓
  AI    DB           Artifact
        │               │
        ├─ PostgreSQL   └─ Object Storage
        ├─ pgvector
        └─ Redis

Security / Audit
        ↓
PostgreSQL audit/security events

Finalized Artifact
        ↓
SHA-256
        ↓
Hyperledger Fabric
```

------------------------------------------------------------------------

## 3. Services to Prepare Before Development

### P0 --- Immediate Shared Services (Cloud APIs + .env distribution)

``` text
1. Neon DB (Serverless PostgreSQL with pgvector extension enabled)
2. Upstash Redis (Serverless Redis via rediss:// connection string)
3. Supabase Storage / Cloudflare R2 / AWS S3 (S3-compatible bucket for artifacts/sources)
4. .env distribution with shared connection strings to all 5 teammates
5. Docker Compose (maintained as local offline development environment)
```

### P1

``` text
7. HTTPS/reverse proxy
8. backups
9. structured logging
10. monitoring
```

### P2

``` text
11. Hyperledger Fabric
12. advanced security hardening
```

------------------------------------------------------------------------

## 4. PostgreSQL (Neon DB / Cloud PostgreSQL API)

Provide a shared development PostgreSQL instance so all 5 teammates share identical live sessions, documents, and CCO states.

Recommended Primary Service: **Neon DB** (Serverless PostgreSQL)
Fallback: Local Docker PostgreSQL container

Requirements:

``` text
• PostgreSQL 16+
• pgvector extension enabled (run: CREATE EXTENSION IF NOT EXISTS vector;)
• SSL connection string: postgresql://user:password@ep-xyz.neon.tech/contentforge?sslmode=require
• Shared connection string distributed in team .env
• Network access from local FastAPI/AI workers
```

P3 owns schema/migrations.

P1 must not create duplicate application tables.

------------------------------------------------------------------------

## 5. PostgreSQL Data Boundary

PostgreSQL stores metadata and structured state:

``` text
users
roles
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

Actual large binary files do NOT belong in PostgreSQL.

------------------------------------------------------------------------

## 6. pgvector

Enable the vector extension on the shared Neon DB instance:

``` sql
CREATE EXTENSION IF NOT EXISTS vector;
```

P1 owns:

``` text
embedding model
chunk embedding
retrieval strategy
similarity logic
```

P5 provisions the reliable database service with vector capability.

------------------------------------------------------------------------

## 7. Object Storage (Cloud S3 API / Supabase Storage / MinIO)

Provision shared S3-compatible cloud object storage so uploaded PDFs and generated PPTX/PDF artifacts are globally accessible by all team members:

Primary Services: **Supabase Storage** / **Cloudflare R2** / **AWS S3**
Fallback: Local MinIO container via `docker-compose.yml`

Use it for:

``` text
source PDFs
source DOCX files
source images
generated PPTX
generated PDF
generated DOCX
generated SVG/PNG
preview assets
```

Recommended logical structure:

``` text
contentforge/
├── sources/
│   └── {document_id}/
│       └── {version}/source.pdf
│
├── artifacts/
│   └── {artifact_id}/
│       └── {version}/
│           ├── artifact.pptx
│           └── preview.pdf
│
└── temporary/
```

------------------------------------------------------------------------

## 8. PPT/PDF Storage Workflow

Team decision:

> Generated binary artifacts are stored before they are served.

Correct flow:

``` text
P1
 ↓
Verified Presentation JSON
 ↓
P4
 ↓
presentation.pptx
 ↓
Object Storage
 ↓
P3 records artifact metadata
 ↓
Frontend
 ↓
Download endpoint / signed URL
```

Do NOT send a large PPTX as the primary response to the long-running
transformation request.

------------------------------------------------------------------------

## 9. Storage Metadata

P3 should persist:

``` text
artifact_id
artifact_version
artifact_type
storage_key
mime_type
checksum
size
status
created_at
```

Example:

``` text
artifact_id: ART-001
type: presentation
version: 1
storage_key: artifacts/ART-001/1/artifact.pptx
mime_type: application/vnd.openxmlformats-officedocument.presentationml.presentation
checksum: sha256:...
status: VERIFIED
```

------------------------------------------------------------------------

## 10. Redis

Prepare Redis for:

``` text
job queue/state
temporary cache
rate limiting
ephemeral coordination
```

Do NOT use Redis as permanent storage.

Recommended:

``` text
FastAPI
  ↓
Redis
  ↓
Worker
```

The worker executes P1 AI jobs without blocking HTTP requests.

------------------------------------------------------------------------

## 11. Docker Compose

Prepare a reproducible development environment.

Minimum:

``` text
frontend
backend
postgres
redis
minio
```

Optional:

``` text
worker
reverse-proxy
```

Goal:

``` text
git clone
 ↓
configure .env
 ↓
docker compose up
 ↓
system starts
```

------------------------------------------------------------------------

## 12. Environment Variables

Create:

``` text
.env.example
```

Categories:

``` text
DATABASE_URL
REDIS_URL
S3_ENDPOINT
S3_ACCESS_KEY
S3_SECRET_KEY
S3_BUCKET
JWT_SECRET
LLM_API_KEY
EMBEDDING_CONFIG
HYPERLEDGER_CONFIG
```

Never commit real secrets.

------------------------------------------------------------------------

## 13. Network Design

For development:

``` text
Frontend
   ↓
FastAPI
   ↓
private services
 ├── PostgreSQL
 ├── Redis
 └── MinIO
```

Do not expose PostgreSQL, Redis or MinIO unnecessarily to the public
internet.

------------------------------------------------------------------------

## 14. File Security

Before AI ingestion:

``` text
Upload
 ↓
MIME validation
 ↓
Size validation
 ↓
File safety/malware check
 ↓
Quarantine if necessary
 ↓
AI processing
```

Never execute uploaded files.

Treat uploaded documents as untrusted.

------------------------------------------------------------------------

## 15. Prompt-Injection Infrastructure Support

P1 owns AI defense.

P5 provides:

``` text
input validation
request tracing
security event persistence
network isolation
rate limiting
least privilege
service isolation
```

Example:

``` text
P1 detects prompt injection
       ↓
security event
       ↓
P3 event service
       ↓
PostgreSQL security_events
       ↓
Admin UI
```

------------------------------------------------------------------------

## 16. Rate Limiting

Provide rate limiting support for:

``` text
login
upload
transformation creation
admin APIs
download endpoints
```

Exact limits can be tuned jointly by P3/P5.

------------------------------------------------------------------------

## 17. Audit Infrastructure

Audit records need:

``` text
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

Events:

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

Security events:

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

------------------------------------------------------------------------

## 18. Secrets

Never place API keys, database passwords, JWT secrets, S3 credentials or
Hyperledger credentials in Git.

Use:

``` text
environment variables
secret manager
CI/CD secrets
```

------------------------------------------------------------------------

## 19. HTTPS

Prepare a reverse proxy/gateway for:

``` text
HTTPS
TLS termination
routing
basic request controls
```

Internal database/cache traffic should not be publicly exposed.

------------------------------------------------------------------------

## 20. Backups

Minimum:

``` text
PostgreSQL
 ↓
scheduled backup

Object Storage
 ↓
persistent volume / backup

Redis
 ↓
not authoritative
```

Prioritize backups for:

``` text
PostgreSQL
source files
finalized artifacts
provenance metadata
```

------------------------------------------------------------------------

## 21. Monitoring

Track:

``` text
API errors
AI job failures
job latency
database availability
Redis availability
storage failures
authentication failures
security events
disk usage
```

Structured logs should include:

``` text
request_id
service
timestamp
level
event
```

------------------------------------------------------------------------

## 22. CI/CD

Minimum:

``` text
push
 ↓
lint
 ↓
tests
 ↓
dependency/security scan
 ↓
container build
 ↓
deploy/stage
```

Add secret scanning and container scanning where available.

------------------------------------------------------------------------

## 23. Provenance / Blockchain

Blockchain is NOT file storage.

Source files and PPTX/PDF binaries remain off-chain.

Before anchoring:

``` text
CCO version
+
transformation parameters
+
final artifact
+
verification result
        ↓
canonical provenance payload
        ↓
SHA-256
        ↓
Hyperledger Fabric
```

Store on-chain only minimal provenance:

``` text
artifact_id
cco_version
artifact_hash
verification status/hash
timestamp
transaction ID
```

------------------------------------------------------------------------

## 24. Tamper Detection

Finalization:

``` text
Artifact
 ↓
SHA-256 = ABC123
 ↓
Ledger anchor
```

Later:

``` text
Artifact
 ↓
SHA-256 = XYZ999
 ↓
Compare with ledger
 ↓
MISMATCH
```

Display:

``` text
PROVENANCE VERIFICATION FAILED
```

------------------------------------------------------------------------

## 25. CI/CD and Security Definition

A deployment should not be considered ready unless:

``` text
secrets are externalized
dependencies are scanned
containers build
tests pass
HTTPS is configured where applicable
private services are not publicly exposed
logs are structured
health checks exist
```

------------------------------------------------------------------------

## 26. Immediate Handoff to P3

Give P3:

``` text
DATABASE_URL
REDIS_URL
S3_ENDPOINT
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

plus:

``` text
PostgreSQL version
pgvector availability
storage limits
Redis connection details
backup policy
```

P3 wires these into FastAPI.

------------------------------------------------------------------------

## 27. Immediate Handoff to P1

Give P1:

``` text
PostgreSQL/pgvector availability
object-storage read/write capability
sample source documents
document/storage key format
chunk metadata expectations
embedding storage expectations
```

P1 should not embed infrastructure credentials into AI code.

------------------------------------------------------------------------

## 28. First Build Order

### Step 1 --- Environment

``` text
Docker
PostgreSQL
pgvector
Redis
MinIO
```

### Step 2 --- Security foundation

``` text
Secrets
network isolation
HTTPS/reverse proxy
file validation
rate limiting
logging
```

### Step 3 --- Backups/monitoring

``` text
DB backups
object storage persistence
health checks
structured logs
```

### Step 4 --- Provenance

``` text
SHA-256
provenance payload
Hyperledger
tamper verification
```

------------------------------------------------------------------------

## 29. Non-Goals

Do not own:

``` text
AI prompt design
CCO extraction
RAG logic
LLM generation
React UI
PPTX content creation
business API logic
```

Your role is to make these components securely deployable and
observable.

------------------------------------------------------------------------

## 30. Definition of Done

Infrastructure is ready when:

``` text
Developer
 ↓
docker compose up
 ↓
FastAPI reaches PostgreSQL
 ↓
pgvector works
 ↓
FastAPI reaches Redis
 ↓
files upload to MinIO
 ↓
files can be retrieved
 ↓
audit/security events persist
 ↓
logs contain request IDs
 ↓
backups exist
 ↓
finalized artifact hash can be generated
 ↓
provenance can be anchored/verified
```

------------------------------------------------------------------------

## 31. Key Principle

> **Keep source documents and generated binaries off-chain and out of
> PostgreSQL. Use PostgreSQL for application truth, object storage for
> files, Redis for ephemeral/job infrastructure, and Hyperledger only
> for tamper-evident provenance.**
