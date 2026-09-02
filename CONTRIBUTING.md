# ContentForge AI — Team Collaboration & Contributing Guide

Welcome to the **ContentForge AI** team repository. To ensure smooth multi-developer velocity across our frontend and backend engineers, all team members must adhere to these guidelines.

---

## 🌿 1. Branching Workflow

We follow a GitFlow-inspired branching model:

```text
main (Production releases)
  ▲
  │ (Release / Demo Tagging)
develop (Active integration branch)
  ▲
  ├── feature/frontend-session-workspace
  ├── feature/backend-auth-jwt
  ├── feature/ai-cco-pipeline
  ├── feature/renderer-pptx
  └── feature/infra-minio-storage
```

### Rules
1. Branch all new work from `develop` (or sync directly to `main` when instructed).
2. Keep feature branches small, focused, and testable.
3. Keep your branch up to date by rebasing or merging frequently.

---

## ✍️ 2. Commit Message Guidelines

Use clear, structured commit messages adhering to Conventional Commits:

- `feat(frontend): add document upload dropzone and progress indicator`
- `feat(backend): implement session CRUD endpoints in /api/v1/sessions`
- `feat(ai): integrate deterministic extractor with CCO builder`
- `feat(render): build baseline presentation PPTX renderer`
- `fix(auth): correct token expiration calculation`
- `docs: update feature registry with FEAT-002`

---

## 🔄 3. Pull Request (PR) Checklist

Before submitting a Pull Request:

- [ ] Code is placed in the proper package (`frontend/`, `backend/`, `docs/`, or `registry/`).
- [ ] Registered the new feature/change in [`registry/FEATURE_REGISTRY.md`](./registry/FEATURE_REGISTRY.md).
- [ ] No secrets or `.env` files are tracked in Git.
- [ ] Code passes local tests (`uv run pytest`) and linting.
- [ ] At least one teammate has reviewed and approved the PR.

---

## ✅ 4. Definition of "Done"

A feature is **not done** when it only runs on your local machine. It is done when:

1. **API contract is stable** and documented in OpenAPI (`/docs`).
2. **Validation exists** for all inputs and schemas.
3. **Errors are gracefully handled** without crashing the application.
4. **Database state is properly persisted** where required.
5. **Frontend integration works** where applicable.
6. **Feature Registry is updated** in `registry/FEATURE_REGISTRY.md` with instructions on how to view/verify.
7. **Another teammate can pull the branch and run it**.
