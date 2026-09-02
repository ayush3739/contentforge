# ContentForge AI

> **SIH 2026 — SIH26154 | Elite Coders**

ContentForge AI converts one source document into multiple trustworthy, audience-specific communication artefacts by understanding the source once, creating a versioned **Canonical Content Object (CCO)**, retrieving supporting evidence, generating structured content, verifying every claim, and delivering versioned artefacts (PPTX, PDF, DOCX, HTML) with cryptographic provenance.

---

## 📁 Repository Structure

```text
contentforge/
├── frontend/                # P2: Next.js / React UI (Operator workspace, CCO viewer, Review queue, Artifact preview)
├── backend/                 # P1, P3, P4, P5: FastAPI Core, AI Pipeline, Artifact Renderers, DB & Storage
├── docs/                    # Project Documentation Hub
│   ├── prds/                # Product Requirements Documents (PRDs)
│   └── specifications/      # Official engineering contracts, work orders & role architecture specs
├── registry/                # Live feature registry (FEATURE_REGISTRY.md) & working logs
├── docker-compose.yml       # Shared local infrastructure (PostgreSQL+pgvector, Redis, MinIO)
├── .env.example             # Master environment variable template
├── .gitignore               # Standard Git ignore rules
├── .agents                  # Operating guidelines and feature registry protocol for AI agents
├── AGENTS.md                # Visible agent operating guidelines
├── CONTRIBUTING.md          # Git branching strategy, PR checklist, and Definition of Done
└── README.md                # This file
```

---

## 👥 Five-Person Team Ownership

| Role | Engineer | Workspace | Primary Ownership | Master Reference |
|---|---|---|---|---|
| **P1** | AI Engineer | [`backend/app/ai/`](./backend) | CCO creation, RAG, prompt compilation, structured generation, grounding verification | [`docs/specifications/01_P1_AI_ENGINEER.md`](./docs/specifications/01_P1_AI_ENGINEER.md) |
| **P2** | Frontend Engineer | [`frontend/`](./frontend) | Next.js/React operator UI, review queue, artifact viewers, admin screens | [`docs/prds/ContentForge_AI_Frontend_PRD.md`](./docs/prds/ContentForge_AI_Frontend_PRD.md) |
| **P3** | Backend Engineer | [`backend/`](./backend) | FastAPI public APIs, PostgreSQL models, RBAC, job orchestration, persistence | [`docs/specifications/03_P3_BACKEND_API.md`](./docs/specifications/03_P3_BACKEND_API.md) |
| **P4** | Artifact Engineer | [`backend/app/renderers/`](./backend) | Transformation recipes, PPTX/PDF/DOCX/HTML renderers, SHA-256 checksums | [`docs/specifications/04_P4_OUTPUT_ARTIFACT.md`](./docs/specifications/04_P4_OUTPUT_ARTIFACT.md) |
| **P5** | Cloud/Cyber/Blockchain | [`backend/`, `docker-compose.yml`](./) | Infrastructure, Docker, storage, security controls, audit, Hyperledger provenance | [`docs/specifications/05_P5_CLOUD_CYBER_BLOCKCHAIN.md`](./docs/specifications/05_P5_CLOUD_CYBER_BLOCKCHAIN.md) |

> 📖 **Team Work Order & Contract:** All team members must review [`docs/specifications/00_CONTENTFORGE_WORK_ORDER.md`](./docs/specifications/00_CONTENTFORGE_WORK_ORDER.md) and [`docs/specifications/00_TEAM_INTEGRATION_CONTRACT.md`](./docs/specifications/00_TEAM_INTEGRATION_CONTRACT.md).  
> 📋 **Feature Tracker:** View and log all feature progress in [`registry/FEATURE_REGISTRY.md`](./registry/FEATURE_REGISTRY.md).

---

## 🏛️ System Architecture

```text
                         USERS / OPERATOR
                                │
                                ▼
                     ┌─────────────────────┐
                     │   FRONTEND (P2)     │
                     │   Next.js / React   │
                     └──────────┬──────────┘
                                │ HTTPS / JSON
                                ▼
                     ┌─────────────────────┐
                     │    BACKEND (P3)     │
                     │    FastAPI Core     │
                     └──────┬─────┬────────┘
                            │     │
               ┌────────────┘     └────────────┐
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │   AI PIPELINE (P1)   │        │ ARTIFACT ENGINE (P4) │
    │                      │        │                      │
    │ Ingestion & CCO      │        │ Recipes              │
    │ RAG / pgvector       │        │ PPTX Renderer        │
    │ Prompt Compiler      │        │ PDF / DOCX / HTML    │
    │ Generation & Verify  │        │ Checksum (SHA-256)   │
    └──────────┬───────────┘        └──────────┬───────────┘
               │                               │
               └──────────────┬────────────────┘
                              ▼
              ┌────────────────────────────────┐
              │     DATA & SECURITY LAYER      │
              │ PostgreSQL + pgvector (P3/P5)  │
              │ MinIO / S3 Object Storage (P5) │
              │ Redis Job Queue (P3/P5)        │
              │ Hyperledger Provenance (P5)    │
              └────────────────────────────────┘
```

---

## 🚀 Quickstart

### 1. Configure Local Environment
```bash
cp .env.example .env
# Edit .env with your local credentials, JWT secret, and LLM API keys
```

### 2. Start Core Infrastructure (Docker)
Start PostgreSQL (with `pgvector`) and Redis:
```bash
docker-compose up -d db redis
```

Full details: [`infrastructure/README.md`](./infrastructure/README.md) · [`docs/P5_HANDOFF.md`](./docs/P5_HANDOFF.md).

### 3. Start Backend
```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```
- Swagger UI available at: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check route: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Application accessible at `http://localhost:3000`.

---

## 🎯 Non-Negotiable Architecture Rules

1. **One source, one canonical understanding** (CCO is the semantic source of truth).
2. **All outputs reference a versioned CCO.**
3. **Structured AI JSON**: P1 outputs validated, renderer-neutral JSON.
4. **Renderer Integrity**: P4 transforms structured AI JSON into target formats without fabricating facts.
5. **Untrusted Uploads**: Source documents are treated as untrusted data with strict prompt boundaries.
6. **Server-Side Security**: RBAC (`analyst`, `reviewer`, `admin`) is strictly validated on the backend.
7. **Off-Chain Ledger**: Raw files remain in object storage; only SHA-256 hashes are anchored to Hyperledger Fabric.
8. **Live Feature Registry**: Whenever adding a feature, update [`registry/FEATURE_REGISTRY.md`](./registry/FEATURE_REGISTRY.md).
