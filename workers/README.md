# Workers Workspace — Asynchronous Job Orchestration

> **Shared Ownership:** P3 (Backend API & Jobs) + P1 (AI Execution Integration)  
> **Core Responsibilities:** Background Task Execution, Celery / ARQ / Redis Queue Runners, Ingestion & Transformation Jobs

---

## 🎯 Mission

AI processing, document parsing, embeddings computation, and multi-format artifact rendering take time and must **never run synchronously inside the FastAPI request thread**.
The workers layer picks up queued jobs from Redis, executes long-running pipeline steps, and updates job statuses in PostgreSQL.

---

## 📁 Recommended Structure

```text
workers/
├── tasks/
│   ├── ingestion_tasks.py          # PDF/DOCX parsing and CCO generation
│   ├── transformation_tasks.py     # AI generation, grounding verification, and revision
│   └── rendering_tasks.py          # PPTX and document rendering
├── worker.py                       # Worker runner entrypoint
└── config.py                       # Redis connection and concurrency configuration
```

---

## 🔄 Job Status Lifecycle

```text
QUEUED ──> PROCESSING ──> GENERATING ──> VERIFYING ──> COMPLETED
   │                                                      │
   └──> FAILED                                            └──> REVIEW_REQUIRED
```
