# ContentForge AI — Team Collaboration & Contributing Guide

Welcome to the **ContentForge AI** team repository. To ensure smooth multi-developer velocity without stepping on each other's toes, all five engineers must adhere to these guidelines.

---

## 🌿 1. Branching Workflow

We follow a GitFlow-inspired branching model:

```text
main (Production releases)
  ▲
  │ (Release / Demo Tagging)
develop (Active integration branch)
  ▲
  ├── feature/p1-cco-extraction
  ├── feature/p2-session-workspace
  ├── feature/p3-transformations-api
  ├── feature/p4-pptx-renderer
  └── feature/p5-audit-logging
```

### Rules
1. **Never commit directly to `main` or `develop`.**
2. Branch all new work from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/p<number>-<short-description>
   ```
3. Keep feature branches small, focused, and aligned with your module ownership.
4. Keep your branch up to date with `develop` by rebasing or merging `develop` frequently.

---

## ✍️ 2. Commit Message Guidelines

Use clear, structured commit messages adhering to Conventional Commits:

- `feat(p1-cco): add deterministic date and entity extractor`
- `fix(p3-auth): resolve JWT expiration validation edgecase`
- `refactor(p2-ui): extract EvidenceDrawer component`
- `feat(p4-render): implement baseline executive summary HTML renderer`
- `chore(p5-ci): configure GitHub Actions lint workflow`
- `docs: update API contract for /transformations endpoint`

---

## 🔄 3. Pull Request (PR) Checklist

Before submitting a Pull Request into `develop`:

- [ ] My code lives inside my designated role directory (`ai/`, `frontend/`, `backend/`, `templates/`, `infrastructure/`, `blockchain/`).
- [ ] Any shared schema or API change has been discussed and updated in `docs/` and `backend/app/schemas/`.
- [ ] No secrets or `.env` files are tracked in Git.
- [ ] Code passes local linting and formatting.
- [ ] Tests covering new logic have been added in `tests/` or module test suites.
- [ ] The PR description clearly explains the changes, what endpoints/components were touched, and how to verify.
- [ ] At least one teammate has reviewed and approved the PR.

---

## ✅ 4. Definition of "Done"

As established in Document 00 (Section 20):

A feature is **not done** when it only runs on your local machine. It is done when:

1. **API contract is stable** and documented.
2. **Validation exists** for all inputs and schemas.
3. **Errors are gracefully handled** without crashing the application.
4. **Database state is properly persisted** where required.
5. **Frontend integration works** where applicable.
6. **Tests exist** covering happy and failure paths.
7. **Audit / security behavior is defined** where applicable.
8. **README / docs are updated**.
9. **Another teammate can pull the branch and run it**.

---

## 🔒 5. Security & Secret Boundaries

1. **Untrusted Data**: Uploaded source documents must always be treated as untrusted data. Never execute uploaded code or allow prompts to override system instructions.
2. **Server-Side Enforcement**: Role-based access control (Analyst, Reviewer, Admin) must always be enforced on the backend. Hiding a button on the UI is not security.
3. **Off-Chain Rule**: Raw files and large CCO structures remain off-chain in object storage and PostgreSQL. Only cryptographic SHA-256 hashes and provenance metadata are recorded on the ledger.
