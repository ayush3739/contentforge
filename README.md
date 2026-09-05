# ContentForge AI

> **Smart India Hackathon 2026 — Problem Statement SIH26154**  
> **Team:** Elite Coders  
> **Core Mission:** Enterprise-grade single-source document transformation into verified, audience-specific communication artifacts with cryptographic provenance and anti-hallucination grounding.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL%20%2B%20pgvector-336791.svg?logo=postgresql&logoColor=white)](https://neon.tech)
[![Embeddings](https://img.shields.io/badge/Embeddings-SentenceTransformer%20%2B%20Gemini%20Multimodal-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Auth](https://img.shields.io/badge/Security-Clerk%20RBAC%20%2B%20SHA--256-6C47FF.svg?logo=clerk&logoColor=white)](https://clerk.com)
[![Tests](https://img.shields.io/badge/Tests-39%2F39%20Passing-success.svg)](#-verification--testing)

---

## 📌 Executive Summary & Problem Solved

Organizations handle dense, high-stakes documents daily — technical whitepapers, strategy memos, incident advisories, and operational directives. Communicating these insights across different organizational tiers typically takes days of manual rework, suffers from human transcription errors, risks generative AI hallucinations, and lacks compliance auditability.

**ContentForge AI solves this end-to-end:**
1. **Understand Once:** Ingest complex multi-page PDFs, DOCX, text, or visual diagrams once.
2. **Canonical Content Object (CCO):** Extract and validate an immutable, structured semantic representation containing core claims, entities, key metrics, and extracted facts.
3. **Audience-Specific Artifact Synthesis:** Transform the single CCO into targeted communication formats (Executive Summaries, Infographics, Security Advisories, Presentation Decks, and Video Storyboards).
4. **Zero-Hallucination Grounding:** Cross-verify every generated claim against source document chunks using semantic vector retrieval with strict citation fidelity (≥95% source-referenced, ≥98% verified).
5. **Cryptographic Provenance:** Fingerprint every document chunk and finalized artifact with SHA-256 checksums and immutable audit logging for enterprise compliance.

---

## 🏛️ System Architecture

```
                                  OPERATOR / ANALYST
                                          │
                                          ▼
                   ┌─────────────────────────────────────────────┐
                   │        FRONTEND WORKBENCH (Next.js 16)      │
                   │  • Operator Workspace & Split Workbench     │
                   │  • CCO Semantic Tree & Claim Grounding UI   │
                   │  • Multi-Format Live Artifact Previews      │
                   │  • Admin Governance & Live Audit Trails     │
                   └──────────────────────┬──────────────────────┘
                                          │ HTTPS / REST API (Clerk RBAC)
                                          ▼
                   ┌─────────────────────────────────────────────┐
                   │           BACKEND CORE (FastAPI)            │
                   │  • Session Orchestrator & Document Ingestion│
                   │  • Clerk Auth Validator & Dynamic RBAC      │
                   │  • Job Dispatcher & Provenance Registry     │
                   └──────────────┬────────────────┬─────────────┘
                                  │                │
            ┌─────────────────────┘                └─────────────────────┐
            ▼                                                             ▼
┌─────────────────────────────────────────┐             ┌─────────────────────────────────────────┐
│           AI ENGINE (P1)                │             │       ARTIFACT ENGINE (P4)              │
│ • AST Document Parsers (PDF/DOCX/TXT/MD)│             │ • DOCX Executive Summary Renderer       │
│ • Dual-Tier Multimodal Embeddings:      │             │ • SVG / PNG Infographic Synthesizer     │
│   - SentenceTransformer (Text Chunks)   │             │ • PPTX Presentation Deck Generator      │
│   - Google Gemini 2.0 (Image Inputs)    │             │ • Cybersecurity Advisory Formatter      │
│ • CCO Semantic Extractor & Schema Engine│             │ • Video Storyboard & Social Bundler     │
│ • Grounding Verifier (Claim Attribution)│             │ • SHA-256 Checksum Fingerprinting       │
└───────────────────┬─────────────────────┘             └───────────────────┬─────────────────────┘
                    │                                                       │
                    └──────────────────────────┬────────────────────────────┘
                                               ▼
                   ┌─────────────────────────────────────────────┐
                   │            PERSISTENCE & SECURITY           │
                   │ • Neon PostgreSQL with pgvector (Embeddings)│
                   │ • Tamper-Evident Audit Logs & Security Events│
                   │ • Local & Object Storage (Documents/Outputs) │
                   │ • Off-chain SHA-256 Cryptographic Ledger    │
                   └─────────────────────────────────────────────┘
```

---

## 🌟 Core Features & Modules

### 1. Ingestion & Canonical Content Object (CCO)
- Ingests raw documents (`PDF`, `DOCX`, `TXT`, `MD`, and diagram images).
- Normalizes content into an AST, extracts key sections, and extracts a versioned **CCO** (Canonical Content Object).
- Standardizes entities, statistical metrics, timeline milestones, risk factors, and actionable takeaways into a renderer-agnostic JSON structure.

### 2. Dual-Tier Multimodal Embedding Engine
- **Text Embedding Engine:** Fast, zero-latency local embedding via `SentenceTransformer` (`all-MiniLM-L6-v2`, 384 dimensions) for chunked text retrieval.
- **Multimodal Image Embedding Engine:** Google `models/gemini-embedding-2` strictly deployed for visual diagrams, architectural schematics, and infographic inputs, maintaining high vector alignment.

### 3. Five Production Output Renderers
| Target Artifact | Target Audience | Renderer Output | Highlights |
|---|---|---|---|
| **Executive Summary** | C-Suite / Leadership | `.docx`, `.md` | High-impact 1-2 page strategic brief, KPI callouts, risk mitigations. |
| **Infographic View** | Visual Decision Makers | Interactive UI, `.svg` | Visual timeline, milestone trackers, metric cards, dynamic layout. |
| **Security Advisory** | SOC / IT Engineering | `.docx`, `.json`, `.md` | Threat intelligence format, CVSS scores, IOC lists, remediation protocols. |
| **Presentation Deck** | Stakeholders / All-Hands | `.pptx` | Multi-slide deck with structured layouts, key bullets, and speaker notes. |
| **Social & Video Package** | Marketing / Public / PR | `.json`, `.md` | Platform-tuned social copy (X, LinkedIn) + scene-by-scene video storyboard. |

### 4. Grounding Verification & Anti-Hallucination Guard
- Every generated claim is automatically linked to its corresponding source chunk ID.
- Semantic vector similarity evaluates contextual relevance.
- Claims falling below strict threshold margins are flagged for human operator review before finalization.

### 5. Enterprise Security & Audit Trail
- **Authentication:** Clerk JWT verification with backend permission synchronization.
- **Role-Based Access Control (RBAC):**
  - `admin`: System governance, live PostgreSQL audit logs, user management, security events.
  - `reviewer`: Human-in-the-loop artifact review, claim override, final artifact approval.
  - `analyst`: Workspace session creation, document upload, and artifact generation.
- **Audit Logs:** Every document ingestion, transformation step, finalization, and security event is recorded in PostgreSQL with actor attribution, IP address, and cryptographic hashes.

### 6. Modern Frontend Operator Workspace
- Built with **Next.js 16** (App Router, Turbopack) and **React 19**.
- Split-screen workbench: live document view alongside generated artifact previews.
- Client-side pre-hydration protection preventing browser extension DOM mismatches.
- Fully accessible dark and light visual themes with glassmorphism aesthetics.

---

## 📁 Repository Structure

```text
contentforge/
├── frontend/                        # Next.js 16 / React 19 Frontend
│   ├── src/
│   │   ├── app/                     # App Router Pages
│   │   │   ├── admin/               # Governance: /users, /audit-logs, /security-events
│   │   │   ├── artifacts/           # Finalized artifact viewer & export
│   │   │   ├── dashboard/           # Workspace dashboard & quick telemetry
│   │   │   ├── sessions/            # Session lifecycle: /new, /[sessionId] workbench
│   │   │   └── transformations/     # Generation progress & status
│   │   ├── components/              # Modular UI Component Library
│   │   │   ├── admin/               # Live Audit & User management tables
│   │   │   ├── artifacts/           # Slide, Docx, Infographic, Video viewers
│   │   │   ├── cco/                 # Canonical Content Object tree viewer
│   │   │   └── layout/              # Sidebar, TopBar, ThemeProvider
│   │   └── lib/                     # API client, Clerk integration & helpers
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                         # FastAPI / Python 3.11+ Core Engine
│   ├── app/
│   │   ├── ai/                      # AI Engine & Intelligence Pipeline
│   │   │   ├── cco/                 # CCO schema definitions & compiler
│   │   │   ├── chunking/            # Document chunking & token counting
│   │   │   ├── embeddings.py        # SentenceTransformer + Gemini multimodal
│   │   │   ├── gateway.py           # LLM Gateway (Gemini / OpenAI / Mock)
│   │   │   ├── generation/          # Template-specific generators
│   │   │   └── verification/        # Grounding & citation verifiers
│   │   ├── api/v1/                  # REST API Endpoints
│   │   │   ├── admin.py             # Live PostgreSQL audit, users, events
│   │   │   ├── artifacts.py         # Finalization, downloads, SHA-256
│   │   │   ├── auth.py              # User roles, permissions, Clerk handshake
│   │   │   ├── documents.py         # Document upload, parsing, CCO extract
│   │   │   ├── sessions.py          # Session creation & workspace state
│   │   │   └── transformations.py   # Transformation job dispatch & progress
│   │   ├── core/                    # Settings, Database engine, Redis, Logging
│   │   ├── models/                  # SQLAlchemy ORM Models (pgvector)
│   │   ├── renderers/               # Output Renderers (PPTX, DOCX, SVG, Infographics)
│   │   ├── schemas/                 # Pydantic v2 Request/Response Schemas
│   │   └── services/                # Business logic, audit logging, storage
│   ├── tests/                       # 39 Unit and Integration Tests
│   └── pyproject.toml               # Dependencies managed via uv
│
├── docs/                            # Project Documentation
│   ├── prds/                        # Product Requirement Documents
│   ├── specifications/              # Role specifications & engineering contracts
│   └── ContentForge_SIH26154_Test_Corpus/ # Ground-truth test documents & PDFs
│
├── registry/
│   └── FEATURE_REGISTRY.md          # Live engineering capability & feature log
├── docker-compose.yml               # Local infrastructure (Postgres, Redis, MinIO)
├── .gitignore                       # Git ignore rules (includes storage_data/ and data/)
├── AGENTS.md                        # AI coding agent operating guidelines
└── README.md                        # Master Project Documentation (this file)
```

---

## 👥 Five-Person Engineering Ownership

| Role | Responsibility | Workspace | Primary Specification |
|---|---|---|---|
| **P1 — AI Engineer** | CCO schema, multimodal embeddings, prompt compiler, generation, grounding verification | [`backend/app/ai/`](./backend/app/ai/) | [`docs/specifications/01_P1_AI_ENGINEER_UPDATED(1).md`](./docs/specifications/01_P1_AI_ENGINEER_UPDATED(1).md) |
| **P2 — Frontend Engineer** | Next.js operator UI, split-workbench, artifact visualizers, admin dashboards | [`frontend/`](./frontend/) | [`docs/prds/ContentForge_AI_Frontend_PRD.md`](./docs/prds/ContentForge_AI_Frontend_PRD.md) |
| **P3 — Backend API Engineer** | FastAPI core, Neon PostgreSQL schemas, session state, REST contracts | [`backend/app/api/`](./backend/app/api/) | [`docs/specifications/03_P3_BACKEND_API_UPDATED(1).md`](./docs/specifications/03_P3_BACKEND_API_UPDATED(1).md) |
| **P4 — Output Artifact Engineer** | PPTX, DOCX, SVG infographic renderers, template registry, design system | [`backend/app/renderers/`](./backend/app/renderers/) | [`docs/specifications/04_P4_OUTPUT_ARTIFACT.md`](./docs/specifications/04_P4_OUTPUT_ARTIFACT.md) |
| **P5 — Security & Infrastructure** | RBAC, tamper-evident audit logging, cryptographic checksums, deployment | [`backend/app/core/`](./backend/app/core/) | [`docs/specifications/05_P5_CLOUD_CYBER_BLOCKCHAIN_UPDATED(1).md`](./docs/specifications/05_P5_CLOUD_CYBER_BLOCKCHAIN_UPDATED(1).md) |

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Python:** 3.11 or higher (managed with [`uv`](https://github.com/astral-sh/uv))
- **Node.js:** v18 or higher (v20+ recommended)
- **Database:** PostgreSQL with `pgvector` extension (Neon Cloud or local Docker)

### 1. Backend Setup

```bash
cd backend

# 1. Install dependencies using uv
uv sync

# 2. Configure environment
# Copy and adjust .env with your PostgreSQL database URL, Gemini API Key, and Clerk secret
cp .env.example .env

# 3. Start the FastAPI server
uv run uvicorn app.main:app --port 8000 --reload
```

- **Interactive API Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Setup

```bash
cd frontend

# 1. Install packages
npm install

# 2. Configure frontend environment
# Provide your Clerk publishable key and backend API base URL
cp .env.example .env.local

# 3. Start the Next.js development server
npm run dev
```

- **Operator Web Application:** [http://localhost:3000](http://localhost:3000)

---

## 🧪 Verification & Testing

ContentForge AI maintains a comprehensive automated testing suite across both frontend and backend layers:

### Backend Tests (pytest)
```bash
cd backend
uv run pytest tests/ -v
```
- **39 passing tests** covering:
  - Document ingestion, AST normalization, and CCO extraction.
  - SentenceTransformer and Google Gemini multimodal image embedding.
  - Template generation for all 5 artifact types.
  - PPTX, DOCX, and SVG rendering integrity.
  - RBAC permission enforcement and audit log integrity.

### Frontend Typecheck & Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```
- Fully type-safe with zero TypeScript errors.
- Pre-hydration DOM filters active for error-free SSR rendering.

---

## 🔒 Security, Compliance & Governance

1. **Zero Raw Ledger Bloat:** Raw files remain off-chain in object storage; only **SHA-256 hashes** and verification metadata are committed to audit ledgers.
2. **Untrusted Upload Sanitization:** Source uploads are treated as hostile, untrusted inputs. Prompt injection boundaries isolate user text from LLM system instructions.
3. **Fail-Closed Multi-Tenancy:** Backend endpoints validate user tenancy and enforce RBAC on every API request.
4. **Git Hygiene:** Local storage directories (`storage_data/`, `data/`) and credentials (`.env`) are strictly excluded from source control.

---

## 📜 Live Feature Registry

All completed, in-progress, and verified capabilities are tracked in the live feature registry:
👉 [**View FEATURE_REGISTRY.md**](registry/FEATURE_REGISTRY.md)

---

*ContentForge AI — Developed for Smart India Hackathon 2026 (SIH26154).*
