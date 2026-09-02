# Backend Workspace — FastAPI, AI Pipeline & Artifact Engine

> **Owners:**  
> - **P3:** Backend API Engineer (FastAPI, PostgreSQL/pgvector, Auth/RBAC, Job Orchestration)  
> - **P1:** AI Engineer (Document Ingestion, CCO, RAG, Structured Generation, Verification)  
> - **P4:** Artifact Engineer (Transformation Recipes, PPTX/PDF/DOCX Renderers, Checksums)  
> - **P5:** Security & Storage Integration (Audit Logging, MinIO/S3, Blockchain Provenance Anchoring)  
>  
> **Master Specifications:**  
> - [`docs/00_CONTENTFORGE_WORK_ORDER.md`](../docs/00_CONTENTFORGE_WORK_ORDER.md)  
> - [`docs/03_P3_BACKEND_API.md`](../docs/03_P3_BACKEND_API.md)  
> - [`docs/01_P1_AI_ENGINEER.md`](../docs/01_P1_AI_ENGINEER.md)  
> - [`docs/04_P4_OUTPUT_ARTIFACT.md`](../docs/04_P4_OUTPUT_ARTIFACT.md)

---

## 🎯 Mission

The `backend/` directory houses the complete server-side application:
1. **FastAPI Application & APIs (`app/api/v1/`)**: Auth, sessions, document ingestion, transformation workflows, artifact delivery, and admin/audit endpoints.
2. **AI Intelligence Engine (`app/ai/`)**: CCO extraction, pgvector RAG, prompt compilation with injection defenses, structured JSON generation, and grounding verification.
3. **Artifact Renderers & Recipes (`app/renderers/`)**: PPTX generation, HTML/PDF rendering, recipe schemas, and cryptographic SHA-256 checksums.
4. **Data & Storage Layer (`app/models/`, `app/storage/`)**: PostgreSQL with pgvector for relational data and embeddings; MinIO/S3 for binary artifacts and source documents.
5. **Background Jobs (`app/jobs/`)**: Asynchronous Redis job queue executing AI generation and rendering without blocking HTTP request threads.

---

## 📁 Repository Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/                      # FastAPI routers (/auth, /sessions, /documents, /transformations, /artifacts, /admin)
│   ├── ai/                          # P1: AI Intelligence Pipeline
│   │   ├── ingestion/               # Document parsers (PDF, DOCX, TXT)
│   │   ├── extraction/              # Deterministic & LLM extraction
│   │   ├── cco/                     # Canonical Content Object model & versioning
│   │   ├── chunking/                # Semantic text chunking with metadata
│   │   ├── retrieval/               # pgvector hybrid & vector search
│   │   ├── planner/                 # Transformation planner
│   │   ├── prompts/                 # Prompt compiler (system policies + untrusted source separation)
│   │   ├── gateway/                 # Model gateway (Gemini, OpenAI, Anthropic, Ollama)
│   │   ├── generation/              # Schema-constrained output generator
│   │   └── verification/            # Grounding & consistency verifier
│   ├── renderers/                   # P4: Artifact Renderers & Recipes
│   │   ├── recipes/                 # JSON recipes (presentation.json, executive_summary.json, advisory.json)
│   │   ├── pptx_renderer.py         # python-pptx presentation builder
│   │   ├── html_renderer.py         # Executive summary & advisory HTML/PDF builder
│   │   └── base.py                  # Base renderer with SHA-256 checksum calculator
│   ├── core/                        # Application config, settings, database engine, JWT security
│   ├── middleware/                  # Server-side RBAC middleware, request tracing, audit interceptor
│   ├── models/                      # SQLAlchemy ORM models (User, Session, Document, CCO, Artifact, Audit)
│   ├── schemas/                     # Pydantic v2 validation models
│   ├── services/                    # Business service orchestrators
│   ├── jobs/                        # Redis queue workers & async tasks
│   ├── storage/                     # MinIO / S3 object storage client
│   ├── audit/                       # Append-only audit logger & security event capture
│   └── main.py                      # FastAPI application entrypoint with CORS & OpenAPI setup
├── migrations/                      # Alembic database migration scripts
├── tests/                           # Pytest test suite (API, AI pipeline, renderers)
└── requirements.txt                 # Python dependencies
```

---

## 🚀 Quickstart

```bash
# 1. Navigate to backend directory
cd backend

# 2. Set up Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start local development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive OpenAPI documentation will be accessible at: `http://localhost:8000/docs`.

---

## 🌐 Public API Contract (`/api/v1`)

- **Auth**: `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- **Sessions**: `POST /sessions`, `GET /sessions`, `GET /sessions/{id}`, `PATCH /sessions/{id}`
- **Documents**: `POST /sessions/{id}/documents`, `GET /documents/{id}`, `GET /documents/{id}/versions`, `GET /documents/{id}/download`, `GET /documents/{id}/cco`, `GET /documents/{id}/evidence`
- **Transformations**: `POST /transformations`, `GET /transformations/{id}`, `GET /transformations/{id}/status`
- **Artifacts**: `GET /artifacts/{id}`, `GET /artifacts/{id}/download`, `POST /artifacts/{id}/finalize`
- **Verification**: `GET /artifacts/{id}/verification`, `POST /artifacts/{id}/verify`, `POST /artifacts/{id}/revise`
- **Provenance**: `GET /provenance/{id}`, `POST /provenance/{id}/anchor`
- **Admin**: `GET /admin/users`, `POST /admin/users`, `GET /admin/audit-logs`, `GET /admin/security-events`
