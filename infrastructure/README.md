# Infrastructure & Security Workspace — Person 5 (Cloud & Cybersecurity)

> **Owner:** P5 (Cloud + Cyber + Blockchain Engineer)
> **Master Specification:** [`documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md`](../documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md)
> **Team Contract:** [`documents/00_TEAM_INTEGRATION_CONTRACT.md`](../documents/00_TEAM_INTEGRATION_CONTRACT.md)
> **Full handoff for other teammates:** [`../docs/P5_HANDOFF.md`](../docs/P5_HANDOFF.md)

## Purpose

The secure operational backbone of ContentForge AI: reproducible local infrastructure, secrets handling, RBAC/audit/security-event infrastructure, storage conventions, structured logging, health checks, and the provenance/hashing interface. **P5 does not implement AI logic, the React UI, business APIs, or artifact generation** — see `documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md` §16 for the full non-goals list.

## Folder structure

```
infrastructure/
├── postgres/init/     # DB init scripts (pgvector extension) — mounted into the db container
├── storage/            # S3/MinIO client + storage key generation & validation
├── security/           # RBAC data, security events, file validation, rate limiting
├── audit/               # Audit event constants + validator
├── logging/             # Structured JSON logging + request-id propagation
├── health/               # Standalone service healthcheck script
└── provenance/           # SHA-256 hashing, mock ledger, tamper verification
```

## Local setup

```bash
cp .env.example .env        # never commit .env
docker compose up -d
docker compose ps           # wait for all services to show "healthy"
python3 infrastructure/health/check_services.py   # optional smoke test
```

Stop and remove volumes (full reset):

```bash
docker compose down -v
```

## Docker commands (cheatsheet)

```bash
docker compose config          # validate compose file
docker compose logs -f db      # tail one service's logs
docker compose exec db psql -U postgres -d contentforge
docker compose restart minio
```

## Environment variables

Full reference: [`../docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md). Template: [`../.env.example`](../.env.example).

## Storage

Bucket `contentforge-artifacts`, private by default, key convention documented in [`../docs/STORAGE_CONTRACT.md`](../docs/STORAGE_CONTRACT.md). Use `infrastructure/storage/keys.py` and `client.py` rather than hand-rolling S3 calls.

## Security

- RBAC data + enforcement helper: `infrastructure/security/rbac.py` — see [`../docs/RBAC.md`](../docs/RBAC.md).
- File upload validation + malware-scan hook stub: `infrastructure/security/file_validation.py` — see [`../docs/FILE_SECURITY.md`](../docs/FILE_SECURITY.md).
- Rate limiting (Redis-backed): `infrastructure/security/rate_limit.py` — see [`../docs/RATE_LIMITING.md`](../docs/RATE_LIMITING.md).
- Prompt-injection trust boundary: [`../docs/SECURITY_BOUNDARIES.md`](../docs/SECURITY_BOUNDARIES.md).

### Network security

Local dev keeps `db`/`redis`/`minio` ports exposed on `localhost` for developer convenience — this is fine for a single-machine hackathon setup. Production hardening (private network, no exposed DB/Redis/MinIO ports, reverse proxy + TLS termination) is a separate deployment-preparation concern and intentionally **not** implemented here yet — no reverse proxy has been added since local HTTP is sufficient for now. All containers share the `contentforge-network` Docker network, isolated from the host's other networks.

## Audit

Event constants + validator: `infrastructure/audit/events.py` — see [`../docs/AUDIT_EVENTS.md`](../docs/AUDIT_EVENTS.md). Falls back to structured stdout logging until P3 wires a real `audit_logs` table.

## Logging

`infrastructure/logging/structured_logger.py` — JSON-lines logs with `request_id`/`service`/`timestamp`/`level`/`event`. Not a logging platform, just a consistent shape any service can print to stdout.

## Health checks

Docker-level healthchecks are defined in `docker-compose.yml` for all three data services. Standalone script: `infrastructure/health/check_services.py`. See [`../docs/HEALTHCHECKS.md`](../docs/HEALTHCHECKS.md) for the `/health` vs `/ready` convention P3 should follow.

## Provenance

`infrastructure/provenance/` — hashing, mock ledger (`PROVENANCE_LEDGER_MOCK=true`), tamper verification. Real Hyperledger Fabric integration is explicitly deferred — see [`../docs/PROVENANCE.md`](../docs/PROVENANCE.md).

## Backup

Manual pre-demo backup/restore commands for Postgres and MinIO: [`../docs/BACKUP_POLICY.md`](../docs/BACKUP_POLICY.md). Backups are git-ignored — never commit them.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `docker compose ps` shows `minio-init` exited with non-zero | MinIO wasn't healthy yet when init ran | Should no longer happen — `minio-init` now waits on `condition: service_healthy`. If it still happens, `docker compose logs minio` |
| `psql`/app can't reach Postgres | Container not healthy yet, or port 5432 already used on host | `docker compose ps`, check for a locally-running Postgres on the same port |
| `vector` extension missing | init script didn't run (only runs on a **fresh** volume) | `docker compose down -v && docker compose up -d` to reinitialize |
| MinIO bucket missing | `minio-init` container failed | `docker compose logs minio-init`, then `docker compose up -d minio-init` to retry |
