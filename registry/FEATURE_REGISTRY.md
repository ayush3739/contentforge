# ContentForge AI — Feature Registry & Change Tracker

> **Purpose:** This is the single source of truth for all implemented and in-progress features across the team.  
> **Mandatory Rule for Developers & AI Agents:** Whenever adding, updating, or completing a feature, you **MUST** record it in this file so teammates, leads, and reviewers can view, test, and verify what was built.

---

## 📊 Summary Status Board

| Feature ID | Feature Name | Owner | Branch | Status | Last Updated |
|---|---|---|---|---|---|
| `FEAT-000` | Repository Scaffold & Base Setup | Shared | `develop` | ✅ Completed | 2026-09-02 |
| `FEAT-001` | Streamline to Frontend, Backend & Docs | Shared | `develop` | ✅ Completed | 2026-09-02 |
| `FEAT-002` | Root Registry & Organized Docs Hub (PRDs & Specs) | Shared | `main` | ✅ Completed | 2026-09-02 |
| `FEAT-BE-001`| Backend uv Init, Folder Layout & Health Route | P3 (Backend) | `develop` | ✅ Completed | 2026-09-02 |
| `FEAT-AI-001`| Content Intelligence & Transformation Engine (P1) | P1 (AI) | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-002`| Consolidated Schema Migration & Sample Doc Ingestion | P1 / P3 | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-003`| Server-Sent Events (SSE) Live Transformation Stream | P1 (AI) | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-004`| Agentic RAG Pipeline & CCO Memory Optimization | P1 (AI) | `main` | ✅ Completed | 2026-09-03 |
| `FEAT-AI-005`| AI Ingestion Background Worker & Phase 5 Schemas (SSE) | P1 / P3 | `feature/ai-api-integration` | ✅ Completed | 2026-09-03 |
| `FEAT-FE-002`| Next.js 16 Route Stability, PDF Fallback Parser & Binary Download | P2 / P4 | `main` | ✅ Completed | 2026-09-04 |
| `FEAT-FE-003`| Authoritative Public Sector Light Theme Redesign & Official Brand Logo Integration | P2 (Frontend) | `main` | ✅ Completed | 2026-09-04 |
| `FEAT-AI-006`| Semantic Extraction Scoping Fix, Substantive Document Depth, Dynamic Artifact Tabs & Social Post Viewer | P1 / P2 | `main` | ✅ Completed | 2026-09-04 |
| `FEAT-SYS-001`| Session DB Persistence, Ingestion Terminal Logging, Post-Ingestion Output Flow & UI Clearance Fix | Fullstack | `main` | ✅ Completed | 2026-09-04 |
| `FEAT-AUTH-002`| Institutional Auth Portal Redesign, Email-Based Role Derivation & Standalone Auth Shell | P2 / P3 | `main` | ✅ Completed | 2026-09-04 |
| `FEAT-SEC-001` | Critical Security & Stability Fixes (DB Session Lifetime, CCO Columns, Auth Bypass, Role Derivation) | Fullstack | `main` | ✅ Completed | 2026-09-04 |
| `FEAT-FE-001`| *Example: Session Workspace & CCO Viewer* | P2 (Frontend) | `feature/frontend-workspace` | 📋 Planned | - |
| `FEAT-RN-001`| *Example: Executive Summary HTML Renderer*| P4 (Renderers)| `feature/renderer-exec`| 📋 Planned | - |

---

## 📝 Detailed Feature Log

### [FEAT-002] Root Registry & Organized Docs Hub (PRDs & Specifications)
- **Role / Owner:** Shared (All Roles)
- **Date Added:** 2026-09-02
- **Branch:** `main` / `develop`
- **Status:** ✅ Completed
- **Description:**  
  Established `registry/` at the repository root as the dedicated space for working logs and feature tracking (`FEATURE_REGISTRY.md`). Inside `docs/`, cleanly organized documentation into two clear categories: `docs/prds/` (Product Requirements Documents) and `docs/specifications/` (Technical engineering contracts, work orders, and role architecture specifications). Updated all repository pointers and agent instructions accordingly.
- **Touched / Created Files:**
  - `registry/FEATURE_REGISTRY.md`, `registry/README.md`
  - `docs/prds/` (PRDs)
  - `docs/specifications/` (contracts, work orders, P1-P5 specifications)
  - `docs/README.md`, `README.md`, `CONTRIBUTING.md`, `.agents`, `AGENTS.md`
  - `backend/README.md`, `frontend/README.md`
- **How to View & Verify:**
  - View root directory: `ls -la` (shows `registry/` at root alongside `docs/`, `frontend/`, and `backend/`)
  - Inspect `docs/`: `ls docs/` (shows `prds/` and `specifications/`)
  - Inspect registry: `cat registry/FEATURE_REGISTRY.md`

---

### [FEAT-BE-001] Backend uv Init, Package Structure & Health Route
- **Role / Owner:** P3 (Backend API Engineer)
- **Date Added:** 2026-09-02
- **Branch:** `develop` / `main`
- **Status:** ✅ Completed
- **Description:**  
  Initialized the Python backend project with `uv` (`pyproject.toml` with FastAPI, Uvicorn, Pytest, HTTPX), established initial package directories with purpose documentation (`app/api/v1/`, `app/ai/`, `app/renderers/`, `app/core/`, `app/models/`, `app/schemas/`, `app/services/`, `app/jobs/`, `app/storage/`, `app/audit/`, `migrations/`, `tests/`), created `app/main.py` with CORS and health check routes (`GET /health`, `GET /api/v1/health`), and verified functionality with automated unit tests.
- **Touched / Created Files:**
  - `backend/pyproject.toml`, `backend/.python-version`, `backend/uv.lock`
  - `backend/app/main.py` (FastAPI app with `/health` and `/api/v1/health`)
  - `backend/app/__init__.py`
  - `backend/app/api/__init__.py`, `backend/app/api/v1/__init__.py`
  - `backend/app/ai/__init__.py`, `backend/app/renderers/__init__.py`
  - `backend/app/core/__init__.py`, `backend/app/models/__init__.py`
  - `backend/app/schemas/__init__.py`, `backend/app/services/__init__.py`
  - `backend/app/jobs/__init__.py`, `backend/app/storage/__init__.py`, `backend/app/audit/__init__.py`
  - `backend/migrations/README.md`
  - `backend/tests/__init__.py`, `backend/tests/test_health.py`
- **How to View & Verify:**
  - Run automated tests:
    ```bash
    cd backend
    uv run pytest
    ```
  - Start the backend server:
    ```bash
    cd backend
    uv run uvicorn app.main:app --reload --port 8000
    ```
  - View Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
  - Query health route: [http://localhost:8000/health](http://localhost:8000/health) or `curl http://localhost:8000/health` (Expected output: `{"status":"healthy","service":"backend","database":"ready","version":"0.1.0"}`)

---

### [FEAT-AI-001] Content Intelligence & Transformation Engine (P1)
- **Role / Owner:** P1 (AI Engineer)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Implemented the complete P1 intelligence and transformation pipeline according to `01_P1_AI_ENGINEER_UPDATED(1).md` and `00_TEAM_INTEGRATION_CONTRACT.md`. Includes:
  1. **Database Models & Alembic Migrations:** Full ORM models (`Document`, `DocumentVersion`, `SourceBlock`, `Chunk` with pgvector `Vector(384)`, `CCOVersion`, `TransformationRequest`, `Artifact`, `VerificationResult`, `ProvenanceRecord`, `AuditLog`, `SecurityEvent`) and executed migration `fd0001723855` against Neon DB.
  2. **Model-Agnostic LLM Gateway:** Provider-independent gateway (`LLMProvider`) supporting Google Gemini (`gemini-2.5-flash`), Groq (`llama-3.3-70b-versatile`), and OpenAI fallback.
  3. **Local Vector Embeddings:** Zero-cost, offline-capable sentence-transformers embedding engine (`all-MiniLM-L6-v2`, 384 dimensions) for pgvector RAG indexing.
  4. **Document Ingestion & Understanding:** Layout-aware parser for TXT/MD/PDF, regex-based deterministic extractor (dates, numbers, metrics, CVE/incident IDs), and bounded semantic LLM extractor (claims, entities, key findings).
  5. **Canonical Content Object (CCO) Builder:** Semantic source-of-truth builder with integrity hash (SHA-256), conflict tracking, and evidence linkage.
  6. **Semantic Chunking & pgvector RAG:** 300-500 token window chunker with page/section provenance and cosine distance similarity search.
  7. **Transformation Planner & Prompt Compiler:** Tamper-resistant prompt compiler enforcing strict source/instruction separation to prevent prompt injection.
  8. **Structured Generation & Verification Engine:** Pydantic schema validation for Presentation (slides), ExecutiveSummary, and Advisory; automated grounding checker, unsupported number detection, and bounded automated revision loop (`MAX_REVISIONS = 2`).
  9. **FastAPI Endpoints:** `POST /api/v1/ai/transform` and `GET /api/v1/ai/health`.
- **Key Modules / Files Modified:**
  - `backend/app/models/` (`base.py`, `user.py`, `session.py`, `document.py`, `chunk.py`, `cco.py`, `transformation.py`, `artifact.py`, `provenance.py`, `audit.py`)
  - `backend/migrations/` (`env.py`, `versions/fd0001723855_initial_schema_with_pgvector.py`, `script.py.mako`)
  - `backend/app/core/` (`config.py`, `database.py`)
  - `backend/app/ai/gateway.py`, `backend/app/ai/embeddings.py`
  - `backend/app/ai/ingestion/parser.py`, `backend/app/ai/extraction/deterministic.py`, `backend/app/ai/extraction/semantic.py`, `backend/app/ai/cco/builder.py`
  - `backend/app/ai/chunking/chunker.py`, `backend/app/ai/retrieval/indexer.py`, `backend/app/ai/retrieval/retriever.py`
  - `backend/app/ai/schemas/` (`presentation.py`, `executive_summary.py`, `advisory.py`, `__init__.py`)
  - `backend/app/ai/planner/planner.py`, `backend/app/ai/prompts/compiler.py`, `backend/app/ai/generation/generator.py`
  - `backend/app/ai/verification/verifier.py`, `backend/app/ai/revision/revisor.py`, `backend/app/ai/pipeline.py`
  - `backend/app/api/v1/ai.py`, `backend/app/main.py`
  - `backend/tests/test_ai_pipeline.py`
- **Exposed Endpoints:**
  - `POST /api/v1/ai/transform` — Full transformation pipeline (Input: raw text / document + target formats; Output: verified renderer-neutral JSON)
  - `GET /api/v1/ai/health` — AI subsystem health and active model configuration
- **How to View & Verify:**
  - Run the automated test suite:
    ```bash
    cd backend
    uv run pytest
    ```
    (Expected output: 11 passed tests)
  - Verify database migrations on Neon DB:
    ```bash
    cd backend
    uv run alembic current
    ```
    (Expected output: `fd0001723855 (head)`)
  - Start server and query AI health:
    ```bash
    cd backend
    uv run uvicorn app.main:app --reload --port 8000
    ```
    Visit [http://localhost:8000/api/v1/ai/health](http://localhost:8000/api/v1/ai/health) or check Swagger docs at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### [FEAT-001] Streamline Repository to Frontend, Backend & Docs
- **Role / Owner:** Shared (All Roles)
- **Date Added:** 2026-09-02
- **Branch:** `develop` / `main`
- **Status:** ✅ Completed
- **Description:**  
  Consolidated the repository layout into two primary application packages (`frontend/` and `backend/`) and a single centralized documentation folder (`docs/`). Moved all specification documents from `documents/` into `docs/` and integrated updated work order (`00_CONTENTFORGE_WORK_ORDER.md`), AI engineering specs (`01_P1_AI_ENGINEER.md`), backend specs (`03_P3_BACKEND_API.md`), and cloud/blockchain specs (`05_P5_CLOUD_CYBER_BLOCKCHAIN.md`).
- **Touched / Created Files:**
  - `frontend/` (Next.js application workspace)
  - `backend/` (FastAPI core, AI intelligence, artifact renderers)
  - `docs/` (all contracts, work orders, PRDs, and feature registry)
  - `README.md`, `CONTRIBUTING.md`, `.agents`, `AGENTS.md`
- **How to View & Verify:**
  - View root directory: `ls -la` (only `frontend/`, `backend/`, and `docs/` appear as workspaces)
  - Inspect `docs/` to confirm all specifications are present: `ls docs/`

### [FEAT-AI-002] Consolidated Schema Migration & Sample Multi-Page Test Documents
- **Role / Owner:** P1 (AI Engineer) / P3 (Backend API)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Consolidated database models to simplify maintenance:
  1. Merged `roles` and `user_roles` into a single `role` column on `users`.
  2. Merged `document_versions` into `documents` (`version`, `checksum`, `storage_key`, `status`).
  3. Merged `artifact_versions` into `artifacts` (`version`, `revision_history` JSONB).
  4. Repointed `chunks`, `source_blocks`, and `cco_versions` directly to `documents.id`.
  5. Applied Alembic migration `0f944dc249bc` to Neon PostgreSQL.
  6. Added native Microsoft Word (.docx) support to the ingestion parser alongside PDF and text.
  7. Created multi-page test documents (`sample_documents/cyber_incident_report_INC88412.docx` and `.pdf`) modeling a public sector cyber incident report (SIH26154).
- **Touched / Created Files:**
  - `backend/app/models/user.py`, `document.py`, `chunk.py`, `cco.py`, `artifact.py`, `__init__.py`
  - `backend/app/ai/ingestion/parser.py` (added `parse_docx`)
  - `backend/app/ai/pipeline.py`, `indexer.py`, `retriever.py`
  - `backend/migrations/versions/0f944dc249bc_consolidate_and_simplify_models.py`
  - `backend/scripts/generate_sample_documents.py`
  - `backend/sample_documents/cyber_incident_report_INC88412.docx`
  - `backend/sample_documents/cyber_incident_report_INC88412.pdf`
- **How to View & Verify:**
  - Run test suite: `uv run pytest` (11/11 passing)
  - Inspect sample documents in `backend/sample_documents/`

### [FEAT-AI-003] Server-Sent Events (SSE) Live Transformation Streaming
- **Role / Owner:** P1 (AI Engineer)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Implemented real-time Server-Sent Events (SSE) streaming for the AI document transformation pipeline.
  - Added async generator `run_transformation_pipeline_stream` in `backend/app/ai/pipeline.py`.
  - Exposed `POST /api/ai/transform/stream` returning `text/event-stream`.
  - Streams live milestone events:
    - `event: progress` (stage, percentage 5-95%, description)
    - `event: artifact` (streams individual artifacts as soon as they are generated and verified)
    - `event: complete` (yields the complete `PipelineTransformResponse` payload)
    - `event: error` (safe error handling without crashing connection)
  - Configured `WindowsSelectorEventLoopPolicy` in `app/main.py` for Psycopg async pool compatibility on Windows.
- **Touched / Created Files:**
  - `backend/app/ai/pipeline.py` (`run_transformation_pipeline_stream`)
  - `backend/app/api/ai.py` (`POST /transform/stream`)
  - `backend/app/main.py` (`WindowsSelectorEventLoopPolicy`)
- **How to View & Verify:**
  - Test via Swagger UI or via `uv run python scripts/run_user_document_pipeline.py`.

---

### [FEAT-AI-004] Agentic RAG Pipeline & CCO Memory Optimization
- **Role / Owner:** P1 (AI Engineer)
- **Date Added:** 2026-09-03
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Overhauled the AI pipeline architecture to move from static RAG querying to Agentic RAG querying.
  1. **Dual-Model Tiering:** Configured separate routing/planning model (`GROQ_ROUTER_MODEL`) and generation model (`GROQ_GENERATION_MODEL`) for cost/speed efficiency.
  2. **CCO Memory Density Optimization:** Removed generic entity extraction from the LLM prompt, relying completely on deterministic regex endpoints for identifiers (CVEs, IPs, dates, currencies), and increased factual claim extraction limits (from 15 to 40).
  3. **Agentic RAG:** Updated `planner.py` to use an LLM (`plan_transformation_async`) to dynamically analyze the CCO and formulate 3-5 hyper-specific context queries instead of a single static search term.
  4. **Schema Enrichment:** Replaced static JSON outputs with robust structures, adding an `ioc_table` and `incident_timeline` to `AdvisorySchema`, and a `financial_exposure` and `strategic_recommendations` breakdown to `ExecutiveSummarySchema`.
  5. **Context Window Expansion:** Updated `compiler.py` to inject larger chunks of the CCO (40 claims, 40 metrics, 40 identifiers) and executed multi-query aggregation in `pipeline.py`.
- **Touched / Created Files:**
  - `backend/app/core/config.py`, `backend/app/ai/gateway.py`
  - `backend/app/ai/extraction/semantic.py`
  - `backend/app/ai/planner/planner.py`
  - `backend/app/ai/pipeline.py`
  - `backend/app/ai/prompts/compiler.py`
  - `backend/app/ai/schemas/advisory.py`, `backend/app/ai/schemas/executive_summary.py`
- **How to View & Verify:**
  - Run `uv run python scripts/run_user_document_pipeline.py`. Inspect `latest_run_output.json` to see the enriched, multi-paragraph schemas and Agentic plan execution.
  - Run test suite: `uv run pytest` (11/11 passing)

---

### [FEAT-FE-002] Next.js 16 Route Stability, PDF Fallback Parser & Binary Download
- **Role / Owner:** P2 (Frontend) & P4 (Renderers)
- **Date Added:** 2026-09-04
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Resolved several critical blocking issues in frontend-to-backend workflows:
  1. Updated Next.js 16 dynamic route pages (`/artifacts/[artifactId]`, `/sessions/[sessionId]`, `/transformations/[transformationId]`) to correctly unwrap `params` using `React.use()` in compliance with React 19/Next 16.
  2. Fixed backend document ingestion parser (`backend/app/ai/ingestion/parser.py`) so that invalid/mock PDF headers or test files gracefully fall back to plain-text layout parsing without crashing the background worker.
  3. Connected the "Download Binary" button in `ArtifactViewer.tsx` to automatically trigger binary downloads of compiled presentation (`.pptx`) or executive summary files from `/api/v1/artifacts/{id}/download`.
  4. Created `frontend/src/lib/utils.ts` and enhanced `frontend/src/proxy.ts` with graceful dev error recovery.
- **Touched / Created Files:**
  - `frontend/src/lib/utils.ts`
  - `frontend/src/proxy.ts`
  - `frontend/src/next.config.ts`
  - `frontend/src/app/artifacts/[artifactId]/page.tsx`
  - `frontend/src/app/sessions/[sessionId]/page.tsx`
  - `frontend/src/app/transformations/[transformationId]/page.tsx`
  - `frontend/src/components/artifacts/ArtifactViewer.tsx`
  - `backend/app/ai/ingestion/parser.py`
- **How to View & Verify:**
  - Run `npx tsc --noEmit` in `frontend/` (0 errors).
  - Open `http://localhost:3000/sessions/SES-27067325` in browser.
  - Click the "Artifacts Workspace" tab to view interactive slides.
  - Click "Download Binary" to trigger PPTX download.

---

### [FEAT-FE-003] Authoritative Public Sector Light Theme Redesign & Official Brand Logo Integration
- **Role / Owner:** P2 (Frontend Engineer)
- **Date Added:** 2026-09-04
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Overhauled the entire frontend user interface to an authoritative, enterprise-grade, public-sector light theme inspired by Sentra AI, Nexora Solutions, Notion AI, and Palantir Workshop. Integrated official logos and eliminated all residual dark-mode styles across 100% of pages and components:
  1. **Official Brand Logo Integration:** Switched sidebar to the standalone emblem mark (`logo.png`) paired with crisp HTML typography (`ContentForge AI`), generated vector `logo.svg`, and replaced the default Vercel favicon across `favicon.ico`, `icon.png`, and `layout.tsx` metadata.
  2. **Sidebar & Layout Overhaul:** Converted the sidebar from dark navy (`#090d16`) to crisp white (`bg-white border-r border-slate-200 shadow-xs`), with royal blue active indicators and light role badge.
  3. **Dashboard & Metric Cards:** Replaced dark gradients with an executive welcome hero banner with an emblem watermark, 4 pristine white metric cards with pastel icon containers, recent sessions table, and review queue list.
  4. **Multi-Artifact Viewer Suite:** Built out dedicated, responsive light-mode viewports for all target formats:
     - **Presentation (PPTX):** 16:9 slide canvas with thumbnail navigator, speaker notes drawer, and full-screen view.
     - **Executive Summary (DOCX/PDF):** Formal government letterhead briefing with key KPI cards, incident impact breakdown, and action items.
     - **Security Advisory:** STIX 2.1 compatible IoC table with 1-click clipboard copy, threat summary, and mitigation checklist.
     - **Visual Infographic:** 4 high-impact metric blocks and 24-hour incident progression timeline.
     - **Video Package:** Production storyboard cards with camera/motion cues and spoken voiceover scripts.
  5. **Admin, Review & Session Pages:** Transformed `/sessions`, `/sessions/new`, `/transformations/[id]`, `/review`, `/admin/users`, `/admin/audit-logs`, and `/admin/security-events` into clean white card interfaces.
  6. **Zero Dark Mode Left:** 0 occurrences of `bg-slate-900`, `bg-slate-950`, `bg-slate-800`, or `border-slate-800` across the codebase.
- **Key Modules / Files Modified:**
  - `frontend/src/components/layout/Sidebar.tsx`
  - `frontend/src/components/layout/Topbar.tsx`
  - `frontend/src/components/layout/AppShell.tsx`
  - `frontend/src/components/layout/RoleGuard.tsx`
  - `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`
  - `frontend/src/app/dashboard/page.tsx`
  - `frontend/src/components/dashboard/MetricCards.tsx`
  - `frontend/src/components/dashboard/RecentSessionsTable.tsx`
  - `frontend/src/components/dashboard/RecentReviewList.tsx`
  - `frontend/src/app/sessions/page.tsx`, `frontend/src/app/sessions/new/page.tsx`
  - `frontend/src/app/sessions/[sessionId]/page.tsx`
  - `frontend/src/components/artifacts/ArtifactViewer.tsx`
  - `frontend/src/components/artifacts/ExecutiveSummaryViewer.tsx`
  - `frontend/src/components/artifacts/AdvisoryViewer.tsx`
  - `frontend/src/components/artifacts/InfographicViewer.tsx`
  - `frontend/src/components/artifacts/VideoPackageViewer.tsx`
  - `frontend/src/components/artifacts/PresentationSlidePreview.tsx`
  - `frontend/src/components/review/ReviewQueueTable.tsx`
  - `frontend/src/app/review/page.tsx`
  - `frontend/src/app/admin/users/page.tsx`, `audit-logs/page.tsx`, `security-events/page.tsx`
  - `frontend/src/components/admin/UserTable.tsx`, `AuditLogTable.tsx`, `SecurityEventTable.tsx`
  - `frontend/src/app/transformations/[transformationId]/page.tsx`
  - `frontend/src/app/login/page.tsx`, `sign-in/page.tsx`, `sign-up/page.tsx`
- **How to View & Verify:**
  - Open `http://localhost:3000/dashboard` to verify the executive light dashboard and white sidebar with official logo.
  - Open `http://localhost:3000/sessions/SES-27067325` to inspect the Dual-Mode Split Workbench and switch between Presentation, Executive Summary, Security Advisory, Visual Infographic, and Video Package.
  - Build check: `npm run build` passes with 14/14 static and dynamic routes compiled.

---

### [FEAT-AI-006] Semantic Extraction Scoping Fix, Substantive Document Depth, Dynamic Artifact Tabs & Social Post Viewer
- **Role / Owner:** P1 (AI Engineer) & P2 (Frontend Engineer)
- **Date Added:** 2026-09-04
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Addressed core pipeline accuracy, document depth, and artifact presentation issues:
  1. **Fixed Python `UnboundLocalError`:** In `backend/app/ai/extraction/semantic.py`, removed a local re-import of `settings` inside an `except` block that caused `extract_semantic_data` to crash on every document ingestion and fall back to an empty 1-sentence dummy claim. Real semantic extraction now reliably runs on uploaded files.
  2. **Substantive Depth Directives:** Removed the terseness constraint (`"Keep explanations terse and high-level; prioritize brevity"`) from `planner.py` and added quality directives to `compiler.py` commanding publication-grade, authoritative narratives with technical depth, concrete metrics, and operational impact.
  3. **Dynamic Artifact Tabs Filtering:** Updated `frontend/src/components/artifacts/ArtifactViewer.tsx` to dynamically inspect `available_formats`. Unselected or ungenerated formats (e.g. video packages or infographics when not chosen) are now hidden from the format switcher.
  4. **Social Communication Viewer:** Built `frontend/src/components/artifacts/SocialPostViewer.tsx` featuring realistic LinkedIn Executive Post and X/Twitter Thread simulators with 1-click clipboard copying.
- **Key Modules / Files Modified:**
  - `backend/app/ai/extraction/semantic.py`
  - `backend/app/ai/planner/planner.py`
  - `backend/app/ai/prompts/compiler.py`
  - `frontend/src/components/artifacts/ArtifactViewer.tsx`
  - `frontend/src/components/artifacts/SocialPostViewer.tsx`
  - `frontend/src/types/artifact.ts`
  - `frontend/src/app/sessions/[sessionId]/page.tsx`
- **How to View & Verify:**
  - Run backend tests: `cd backend && uv run pytest` (18 passed).
  - Run frontend build: `cd frontend && npm run build` (compiled in ~3s).
  - Open `http://localhost:3000/sessions/SES-INCIDENT-88412` to observe filtered artifact tabs matching the selected formats.

---

### [FEAT-000] Initial Repository Scaffold & Shared Contracts
- **Role / Owner:** Shared (All Roles)
- **Date Added:** 2026-09-02
- **Branch:** `develop` / `main`
- **Status:** ✅ Completed
- **Description:**  
  Initialized the ContentForge AI monorepo structure, created master configuration files (`.gitignore`, `.env.example`, `docker-compose.yml`, GitHub Actions CI), and established initial team guidelines.
- **Touched / Created Files:**
  - `README.md`, `CONTRIBUTING.md`, `.gitignore`, `.env.example`, `docker-compose.yml`
  - `.github/workflows/ci.yml`
- **How to View & Verify:**
  - Check git status and branches: `git status`, `git branch -a`

---

### [FEAT-SYS-001] Session DB Persistence, Ingestion Terminal Logging, Post-Ingestion Output Flow & UI Clearance Fix
- **Role / Owner:** Fullstack (P1 AI / P2 Frontend / P3 Backend)
- **Date Added:** 2026-09-04
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  Fixed four critical application workflows:
  1. **Session & Document Database Persistence**: Injected `db: DBSession = Depends(get_db)` into all endpoints in `sessions.py`, `documents.py`, and `transformations.py`, passing `db` to `SessionService`, `DocumentService`, and `TransformationService`. Auto-provisioned user identities in `SessionService` to satisfy PostgreSQL foreign keys, and updated `list_sessions` to load and display all persistent sessions.
  2. **Ingestion Terminal Logging**: Enhanced `orchestrator.py` with stage-by-stage logging for all 6 ingestion stages (storage fetch, block parsing, deterministic rules, semantic LLM extraction, CCO build, pgvector embeddings). Configured unbuffered standard output logging in `logging.py`.
  3. **Post-Ingestion Output Flow ("What to Generate")**: After document upload and CCO extraction, the session workspace guides the user to Step 3: Configure Target Formats (`activeStage = "plan"` / `?tab=transform`), presenting the interactive format cards (PPTX Presentation, Executive Summary, Security Advisory, Infographic, Storyboard, Social Communication) and generation parameters before showing artifacts.
  4. **UI Layout Clearance Fix**: Resolved the header clipping bug where `<main>` kept previous scroll offsets by attaching a scroll reset (`scrollTop = 0`) on route changes in `AppShell.tsx`, and added generous top spacing to `SessionWorkspacePage`.
- **Touched / Created Files:**
  - `backend/app/api/v1/sessions.py` (Injected get_db into all endpoints)
  - `backend/app/api/v1/documents.py` (Injected get_db and added upload logging)
  - `backend/app/api/v1/transformations.py` (Injected get_db and passed db to worker)
  - `backend/app/services/session_service.py` (Auto-provisioned users, added DB logging)
  - `backend/app/core/logging.py` (Added stdout handler & logger propagation)
  - `backend/app/jobs/orchestrator.py` (Stage-by-stage terminal logging)
  - `backend/tests/conftest.py` (Added unit test database fixtures)
  - `frontend/src/components/layout/AppShell.tsx` (Route change scroll-to-top reset)
  - `frontend/src/app/sessions/[sessionId]/page.tsx` (Stage switcher, planner vs artifacts view, unclipped layout)
  - `frontend/src/app/sessions/new/page.tsx` (Redirect to tab=transform after ingestion)
  - `frontend/src/app/transformations/[transformationId]/page.tsx` (Dynamic session return link)
  - `frontend/src/lib/api.ts` (Added fetchSession and Clerk token header forward)
- **How to View & Verify:**
  - Run backend test suite: `uv run pytest` (18/18 passing)
  - Run frontend build: `npm run build` (15/15 routes compiling)
  - Open `http://localhost:3000/sessions/new`, create a session and observe real-time terminal ingestion logs, redirection to Step 3 "What would you like to generate?", unclipped header layout, and persistent entry on `http://localhost:3000/sessions`.

---

### [FEAT-AUTH-002] Institutional Auth Portal Redesign, Email-Based Role Derivation & Standalone Auth Shell
- **Role / Owner:** P2 (Frontend) / P3 (Backend)
- **Date Added:** 2026-09-04
- **Branch:** `main`
- **Status:** ✅ Completed
- **Description:**  
  1. Redesigned `/login` into a full-screen, dual-panel institutional authentication gateway featuring official ContentForge AI emblem (`/logo.png`), national document intelligence branding, and security compliance pillars (Zero-Hallucination Grounding, Automated Role Governance, Cryptographic SHA-256 Ledger).
  2. Fixed Clerk routing runtime warning by switching `<SignIn />` to `routing="hash"`.
  3. Removed the artificial "Demo Quick Access Role Switcher" and obsolete "Reviewer" role option. Implemented automatic identity evaluation in `useAuthStore.ts` and `Topbar.tsx` where admin privileges are derived directly from verified account email (`email.includes('admin')`), while default users operate as Analysts.
  4. Decoupled auth routes (`/login`, `/sign-in`, `/sign-up`) from `AppShell` navigation so workspace sidebars and topbars are omitted on public auth portals.
- **Key Modules / Files Modified:**
  - `frontend/src/app/login/page.tsx` (Dual-panel enterprise login layout, hash routing)
  - `frontend/src/store/useAuthStore.ts` (Email-based role derivation helper `getRoleFromEmail`)
  - `frontend/src/components/layout/Topbar.tsx` (Automatic role sync from authenticated email)
  - `frontend/src/components/layout/AppShell.tsx` (Standalone auth page detection)
- **How to View & Verify:**
  - Open `http://localhost:3000/login` in browser.
  - Observe clean dual-panel institutional layout with 0 Next.js error badges, no sidebar/topbar wrapping, and clean Clerk authentication card.
  - Log in with any email containing "admin" to verify automatic `ADMIN` role assignment in topbar; log in with standard email to verify `ANALYST` role assignment.


---

<!-- 
================================================================================
TEMPLATE FOR NEW FEATURES:
Copy and paste this template below whenever implementing a new feature or task.
================================================================================

### [FEAT-<Area>-<Number>] <Feature Title>
- **Role / Owner:** P1 (AI) | P2 (Frontend) | P3 (Backend) | P4 (Output) | P5 (Infra/Security/Blockchain)
- **Date Added:** YYYY-MM-DD
- **Branch:** feature/<area>-<name>
- **Status:** 🟡 In Progress | ✅ Completed | 🧪 In Review / Testing
- **Description:**  
  <Clear explanation of what the feature does, the problem it solves, and how it fits into the ContentForge pipeline>
- **Key Modules / Files Modified:**
  - `backend/app/path/to/file.py`
  - `frontend/path/to/file.tsx`
- **Exposed Endpoints / Components / Recipes:**
  - `POST /api/v1/your-endpoint` (if backend)
  - `<ComponentName />` (if frontend)
- **How to View & Verify:**
  - Command: `<command to run tests or start service>`
  - URL / Page: `<URL to view the feature in browser or Swagger>`
  - Expected Behavior: `<What someone viewing the feature should observe>`
-->
