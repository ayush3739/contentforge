# P5 Handoff — Infrastructure, Security & Provenance Foundation

> Written by P5 for P1/P2/P3/P4. This is the single doc to read to know what's ready to build on.

## 1. What P5 has completed

- Local Docker infrastructure (PostgreSQL+pgvector, Redis, MinIO) hardened with healthchecks and a race-free bucket-init step.
- `.env.example` reorganized into clear sections; `.gitignore` covers secrets and backups.
- 13 contract docs under `docs/` (storage, RBAC, API, status values, audit, security events, file security, security boundaries, rate limiting, healthchecks, provenance, backup, this handoff).
- Reusable, importable Python modules under `infrastructure/` for storage keys/client, RBAC data + enforcement helper, audit/security event recording, file validation, rate limiting, structured logging, and provenance hashing/ledger/verification.
- CI pipeline: lint/validation job, security job (gitleaks secret scan + `.env` tracking check), P5 test job (`pytest tests/p5`).
- P5-owned tests: hashing determinism, RBAC matrix consistency, storage key path-traversal protection, security/audit event payload validation.

## 2. Services available (after `docker compose up -d`)

| Service | Container | Local address |
|---|---|---|
| PostgreSQL + pgvector | `contentforge-db` | `localhost:5432` |
| Redis | `contentforge-redis` | `localhost:6379` |
| MinIO API | `contentforge-minio` | `localhost:9000` |
| MinIO Console | `contentforge-minio` | `localhost:9001` |

Network: all containers share `contentforge-network`.

## 3. How to run

```bash
cp .env.example .env          # fill in real LLM_API_KEY etc. — never commit .env
docker compose up -d
docker compose ps             # all should show "healthy" within ~30s
python3 infrastructure/health/check_services.py   # optional standalone smoke test
```

## 4. Environment variables you need

See `.env.example` (sectioned: APPLICATION, DATABASE, REDIS, OBJECT STORAGE, AUTH, AI/LLM, BLOCKCHAIN, LOGGING) and `docs/ENVIRONMENT.md` for the full explanation. Nothing here is a real secret — local dev values only.

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/contentforge
REDIS_URL=redis://localhost:6379/0
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_BUCKET=contentforge-artifacts
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
```

## 5. Storage bucket & key format

Bucket: `contentforge-artifacts` (already created by `minio-init`).
Key format: `docs/STORAGE_CONTRACT.md`. In short:
```
sources/{document_id}/{version}/source.{ext}
artifacts/{artifact_id}/{version}/artifact.{ext}
artifacts/{artifact_id}/{version}/preview.pdf
temporary/{session_id}/{uuid}.{ext}
```
Use `infrastructure/storage/keys.py` to generate/validate keys — don't hand-build them (path traversal protection lives there).

## 6. PostgreSQL / pgvector

Reachable at the URL above. `vector` extension is auto-enabled via `infrastructure/postgres/init/01-init.sql` on first container start (idempotent — safe to re-run). **P5 has not created any application tables** — `users`, `sessions`, `documents`, `artifacts`, etc. are P3's schema to design and migrate.

## 7. Redis

Available for caching, job/queue state, and rate-limit counters (`infrastructure/security/rate_limit.py` already uses it). Not a permanent store — don't put data here that needs to survive that shouldn't be lost on flush.

## 8. Auth / RBAC expectations

- P5 does **not** implement login/token issuance — P3 owns `/auth/*`.
- P5 provides the role/permission data + enforcement helper: `infrastructure/security/rbac.py` (`require_permission(role, "approve_artifact")` etc.), matching `docs/RBAC.md` exactly.
- **Enforcement must be server-side on every route** — frontend hiding a button is not authorization.

## 9. Audit event expectations

Use `infrastructure/audit/events.py::record_event(AuditEvent(...))` from wherever an event happens (mostly P3 route handlers). Falls back to structured stdout logging if the `audit_logs` table isn't wired yet — call `set_sink()` once P3's DB writer exists. Event list: `docs/AUDIT_EVENTS.md`.

## 10. Security event expectations

Same pattern: `infrastructure/security/events.py::record_event(SecurityEvent(...))`. P1 calls this when its own detector flags something (e.g. `PROMPT_INJECTION_DETECTED`); P3 calls it for auth/access failures. List + ownership split: `docs/SECURITY_EVENTS.md`.

## 11. API contract expectations

`docs/API_CONTRACT.md` — full route list, auth/error/request-id/status conventions. **P3 owns implementation.** No conflicts found between Doc 00 and Doc 03's route lists.

## 12. Request ID expectations

Every request should carry/receive `X-Request-ID`. `infrastructure/logging/structured_logger.py::set_request_id()` / `get_request_id()` propagate it through a contextvar so any log line in the same request picks it up automatically. P3 sets it in middleware at the top of the request.

## 13. Provenance / hash interface

`infrastructure/provenance/`:
- `hashing.py` — deterministic SHA-256 of bytes or a canonical JSON payload.
- `ledger.py` — `MockLedger` (active while `PROVENANCE_LEDGER_MOCK=true`), same interface a real Hyperledger Fabric client will implement later.
- `verify.py` — tamper check, returns `MATCH`/`MISMATCH`/`NOT_ANCHORED`, auto-emits `HASH_MISMATCH` security event on mismatch.

Trigger point: call `ledger.anchor(...)` when an artifact is finalized (exact status string pending the conflict noted below).

## 14. What P3 needs to integrate

- Wire `infrastructure/security/rbac.py` into real auth dependencies once `/auth/login` exists.
- Wire `infrastructure/audit/events.py` and `infrastructure/security/events.py` into route handlers; point `set_sink()` at the real `audit_logs`/`security_events` tables once those migrations exist.
- Wire `infrastructure/security/rate_limit.py` into middleware.
- Wire `infrastructure/storage/client.py` + `keys.py` into upload/download endpoints.
- Resolve the status-value naming conflict in `docs/STATUS_VALUES.md` (with P1).
- Call `infrastructure/provenance/` at artifact-finalization time.

## 15. What P1 needs to integrate

- Own prompt-injection detection; call `record_event(SecurityEventType.PROMPT_INJECTION_DETECTED, ...)` when it fires — infra/event plumbing is ready.
- Respect the trust-tier boundary in `docs/SECURITY_BOUNDARIES.md` (source content is data, never instructions).
- Coordinate with P3 on the status-value naming conflict (`docs/STATUS_VALUES.md`).

## 16. What P4 needs to integrate

- Use `infrastructure/storage/keys.py::artifact_key()` / `preview_key()` when writing generated artifacts — don't invent your own key scheme.
- Call `infrastructure/provenance/hashing.py::hash_bytes()` on the final artifact before it's considered finalized.
- Large files never go in PostgreSQL — object storage only, per `docs/STORAGE_CONTRACT.md`.

## 17. What P2 needs to know

- All authorization is server-side (§8 above) — UI can still hide controls for UX, but must not rely on that for security.
- `docs/API_CONTRACT.md` documents that long-running transformation/download requests don't return large payloads synchronously — plan polling/status UI accordingly.
- Status values are provisionally two possibly-separate vocabularies (job status vs. artifact lifecycle) — see `docs/STATUS_VALUES.md` before hard-coding UI state strings.

## 18. What is intentionally NOT implemented yet

- Real Hyperledger Fabric network/chaincode (mock ledger only).
- Malware/AV scanning engine (hook interface only, see `docs/FILE_SECURITY.md`).
- Actual FastAPI middleware wiring for rate limiting / RBAC / audit (P5 provides the primitives; P3 wires them in once the app factory exists).
- AWS/Kubernetes/Terraform — explicitly out of scope for this phase; everything here is local-first and designed to be deployable on-premise later.
- Reverse proxy / HTTPS termination — will be added during deployment preparation, not needed for local dev.

## 19. Files created / modified by P5 this pass

See the final report in this session for the exact `git status` / `git diff --stat` output. Nothing has been committed or pushed — review before committing.
