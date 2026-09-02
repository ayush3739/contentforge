# Frontend Workspace — Next.js & React UI

> **Owner:** P2 (Frontend Engineer)  
> **Core Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, TanStack Query, Lucide Icons  
> **Master Specifications:**  
> - [`docs/ContentForge_AI_Frontend_PRD.md`](../docs/ContentForge_AI_Frontend_PRD.md)  
> - [`docs/00_CONTENTFORGE_WORK_ORDER.md`](../docs/00_CONTENTFORGE_WORK_ORDER.md)  
> - [`docs/00_TEAM_INTEGRATION_CONTRACT.md`](../docs/00_TEAM_INTEGRATION_CONTRACT.md)

---

## 🎯 Mission

You own the **complete operator, review, and admin user experience** for ContentForge AI.  
Your focus is building a responsive interface where analysts upload documents, view extracted CCO facts and evidence chunks, configure transformation parameters, monitor generation progress, review grounded claim verifications, and preview/download generated artifacts.

---

## 📁 Recommended Structure

```text
frontend/
├── app/
│   ├── layout.tsx                   # Root layout with responsive navigation & user header
│   ├── page.tsx                     # Landing / dashboard redirect
│   ├── login/page.tsx               # Analyst/Reviewer/Admin login screen
│   ├── dashboard/page.tsx           # Recent sessions, metrics, quick actions
│   ├── sessions/
│   │   ├── new/page.tsx             # Create session & upload source document
│   │   └── [sessionId]/page.tsx     # Session workspace (CCO, Evidence, Planner)
│   ├── transformations/
│   │   └── [transformationId]/page.tsx # Generation progress & live status
│   ├── artifacts/
│   │   └── [artifactId]/page.tsx    # Artifact preview & download workspace
│   ├── review/page.tsx              # Reviewer queue & approval panel
│   └── admin/                       # User management, audit logs, security events
├── components/
│   ├── layout/                      # Sidebar, Header, Breadcrumbs, StatusPill
│   ├── auth/                        # LoginForm, ProtectedRoute
│   ├── sessions/                    # SessionCard, SessionList
│   ├── upload/                      # FileDropzone, UploadProgress
│   ├── cco/                         # CCOViewer, ClaimList, FactTable
│   ├── evidence/                    # EvidenceDrawer, ChunkViewer
│   ├── transformations/             # TransformationPlanner, ParameterForm
│   ├── artifacts/                   # ArtifactCard, PresentationViewer, HTMLPreview, DownloadButton
│   ├── verification/                # VerificationBadge, ClaimVerificationRow
│   └── review/                      # ApprovalControls, RevisionRequestModal
├── lib/
│   ├── api/                         # Axios / Fetch client with auth token interceptor
│   ├── auth/                        # JWT storage, session helpers
│   └── utils/                       # Classnames, formatters, date helpers
├── types/                           # TypeScript definitions matching backend API
└── hooks/                           # Custom React hooks (useSession, useArtifact, etc.)
```

---

## 🚀 Quickstart

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install dependencies (when ready to build)
npm install

# 3. Start local development server
npm run dev
```

The frontend connects to the backend at `http://localhost:8000/api/v1` (configured via `NEXT_PUBLIC_API_URL` in `.env`).

---

## ⚠️ Non-Negotiable Rules for Frontend

1. **No Business or AI Logic in Frontend**: The frontend is purely for presentation and user interaction. Business rules and verification calculations live in the backend.
2. **Server-Side Security**: Frontend hiding of buttons is for UX only. The backend is the true authority on RBAC.
3. **Structured Rendering**: Consume structured JSON from `/api/v1/artifacts/{id}` or renderers; never synthesize or rewrite factual claims in the browser.
