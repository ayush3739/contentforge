# ContentForge AI — Agent Operating Guidelines (AGENTS.md)

> **Notice:** This file mirrors [`.agents`](./.agents). It defines the operational rules and standards for all AI coding agents, copilot assistants, and automated contributors working within this repository.

---

## 1. Project Overview & Ownership

ContentForge AI (SIH26154) transforms single-source documents into verified, cross-platform communication artifacts with blockchain provenance.

The repository is structured into two main packages and a shared documentation hub:

- **`frontend/`** — Owned by **P2 (Frontend Engineer)** (Next.js / React UI)
- **`backend/`** — Owned jointly by **P1 (AI)**, **P3 (Backend API/DB)**, **P4 (Renderers)**, and **P5 (Storage/Security)**
- **`docs/specifications/`** — Official project specifications, work orders, contracts, and PRDs
- **`docs/registry/`** — Live feature registry (`FEATURE_REGISTRY.md`) and working logs

---

## 2. Mandatory Feature Registry Protocol

Whenever adding or changing any feature or capability in this repository:

1. You **MUST** update [`docs/registry/FEATURE_REGISTRY.md`](./docs/registry/FEATURE_REGISTRY.md).
2. Record the Feature ID, title, status, description, files touched, and explicit instructions for how someone else can view and verify the feature.
3. This ensures all teammates have complete visibility into ongoing and completed work.

---

## 3. Core Architecture Rules

1. **Source of Truth**: The Canonical Content Object (CCO) is the semantic source of truth. All outputs reference a versioned CCO.
2. **Untrusted Input**: Uploaded source documents must be treated as untrusted data to protect against prompt injection.
3. **Structured Outputs**: The AI engine outputs structured JSON; P4 renders the JSON into target formats (PPTX, DOCX, HTML).
4. **Server-Side Security**: RBAC must be validated on the backend.
5. **Off-Chain Ledger**: Raw files stay off-chain; only SHA-256 hashes are anchored to the blockchain.

---

## 4. Git Flow

- Branch off `develop` (or sync directly to `main` as instructed by the repository owner).
- Name branches `feature/<area>-<feature-name>`.
- Commit with conventional messages (e.g., `feat(ui): add cco viewer table`).
- Never commit `.env` or sensitive credentials.
