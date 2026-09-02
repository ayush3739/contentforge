# ContentForge AI

> **SIH26154 | Shared Engineering Workspace**

ContentForge AI converts one source into multiple trustworthy communication artefacts by understanding the source once, creating a versioned **Canonical Content Object (CCO)**, retrieving supporting evidence, applying an operator-selected transformation plan, generating structured content, verifying it, and delivering versioned artefacts with cryptographic provenance.

---

## 👥 Five-Person Team Ownership

| Role | Engineer | Folder | Primary Ownership | Reference Specification |
|---|---|---|---|---|
| **P1** | AI Engineer | [`ai/`](./ai) | Complete AI pipeline (Source/Prompt → CCO → RAG → Plan → Generation → Grounding Verification) | [`01_P1_AI_ENGINEER.md`](./documents/01_P1_AI_ENGINEER.md) |
| **P2** | Frontend Engineer | [`frontend/`](./frontend) | Operator UI, Review Queue, Artifact Workspace, Admin & Provenance dashboards | [`ContentForge_AI_Frontend_PRD.md`](./documents/ContentForge_AI_Frontend_PRD.md) |
| **P3** | Backend/API Engineer | [`backend/`](./backend) | FastAPI application APIs, PostgreSQL models, jobs, persistence, session state | [`03_P3_BACKEND_API.md`](./documents/03_P3_BACKEND_API.md) |
| **P4** | Output / Artifact Engineer | [`templates/`](./templates) | Transformation recipes, renderers (PPTX, DOCX/PDF, HTML), artifact preview/export | [`04_P4_OUTPUT_ARTIFACT.md`](./documents/04_P4_OUTPUT_ARTIFACT.md) |
| **P5** | Cloud / Cyber / Blockchain | [`infrastructure/`](./infrastructure) & [`blockchain/`](./blockchain) | Infrastructure, Docker, secrets, RBAC support, audit logs, Hyperledger provenance | [`05_P5_CLOUD_CYBER_BLOCKCHAIN.md`](./documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md) |

> 📖 **Team Integration Contract**: All team members **must read** [`00_TEAM_INTEGRATION_CONTRACT.md`](./documents/00_TEAM_INTEGRATION_CONTRACT.md) before writing code.

---

## 🏛️ System Architecture

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
                  │ Object Storage (S3 / MinIO)       │
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

## 📁 Repository Structure

```text
contentforge/
├── ai/               # P1: AI pipeline modules (CCO, RAG, prompt compiler, generation, verification)
├── frontend/         # P2: Next.js / React application (Pages, Components, Hooks, API client)
├── backend/          # P3: FastAPI core backend (Routers, DB models, RBAC, jobs, persistence)
├── workers/          # P1 + P3: Background workers & task runners (Celery / ARQ / Redis queue)
├── templates/        # P4: Transformation recipes & format renderers (PPTX, DOCX, HTML, Social)
├── infrastructure/   # P5: Cloud orchestration, Dockerfiles, Nginx, deployment scripts
├── blockchain/       # P5: Hyperledger Fabric chaincode & provenance anchoring service
├── documents/        # Core team engineering specifications and PRD documents
├── docs/             # Shared team developer notes, API documentation, and architecture guides
├── tests/            # Shared end-to-end integration and smoke tests
├── docker-compose.yml# Shared local development environment (PostgreSQL+pgvector, Redis)
├── .env.example      # Master environment variable template
├── .gitignore        # Standard Git ignore rules
└── CONTRIBUTING.md   # Branching workflow, PR guidelines, and Definition of Done
```

---

## 🚀 Getting Started

### 1. Clone & Configure Environment
```bash
git clone <repo-url>
cd contentforge

# Copy environment template
cp .env.example .env
# Fill in required secrets (LLM_API_KEY, JWT_SECRET, etc.) in your local .env
```

### 2. Start Core Infrastructure (Docker)
Start PostgreSQL (with `pgvector`) and Redis:
```bash
docker-compose up -d db redis
```

### 3. Role Quickstarts

- **P1 (AI)**:
  ```bash
  cd ai
  # Refer to ai/README.md and documents/01_P1_AI_ENGINEER.md
  ```
- **P2 (Frontend)**:
  ```bash
  cd frontend
  # Refer to frontend/README.md and documents/ContentForge_AI_Frontend_PRD.md
  ```
- **P3 (Backend)**:
  ```bash
  cd backend
  # Refer to backend/README.md and documents/03_P3_BACKEND_API.md
  ```
- **P4 (Output & Artifacts)**:
  ```bash
  cd templates
  # Refer to templates/README.md and documents/04_P4_OUTPUT_ARTIFACT.md
  ```
- **P5 (Infra & Blockchain)**:
  ```bash
  cd infrastructure # or cd blockchain
  # Refer to infrastructure/README.md and documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md
  ```

---

## 🌿 Git Branching Strategy

Follow the branching rules in [`CONTRIBUTING.md`](./CONTRIBUTING.md):

- `main` — Production-ready, stable releases only. Never push directly to `main`.
- `develop` — Shared team integration branch.
- Feature branches branched off `develop`:
  - `feature/p1-<feature-name>` (AI Pipeline)
  - `feature/p2-<feature-name>` (Frontend)
  - `feature/p3-<feature-name>` (Backend API & DB)
  - `feature/p4-<feature-name>` (Recipes & Renderers)
  - `feature/p5-<feature-name>` (Infra, Security & Blockchain)

---

## 🎯 Non-Negotiable Architecture Principles

1. **One source, one canonical understanding** (CCO is the semantic source of truth).
2. **All outputs reference a CCO version.**
3. **RAG retrieves evidence; it is not the source of truth.**
4. **The LLM does not directly control application actions.**
5. **Structured generation is preferred over free-form output.**
6. **Generated claims must be verifiable against evidence.**
7. **Uploaded content is untrusted** (strict prompt injection boundaries).
8. **RBAC is enforced server-side.**
9. **Audit logs are separate from normal application logs.**
10. **Source/artifact files remain off-chain; only provenance hashes go to the ledger.**
