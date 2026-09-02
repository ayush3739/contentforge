# Health Checks

## Docker-level (already enforced in docker-compose.yml)

| Service | Check | Interval |
|---|---|---|
| PostgreSQL (`db`) | `pg_isready -U postgres` | 5s |
| Redis (`redis`) | `redis-cli ping` | 5s |
| MinIO (`minio`) | `mc ready local` | 5s |

`minio-init` now waits for MinIO's healthcheck (`condition: service_healthy`) instead of just `depends_on` start order, so the bucket-creation step can't race a not-yet-ready MinIO.

## Application-level (P3/worker to expose, P5 documents the expectation)

```
GET /health    → 200 if the process is up (no dependency checks)
GET /ready     → 200 only if DB + Redis + object storage are reachable
```

`/health` is for "is the process alive" (used by orchestrators to decide whether to restart). `/ready` is for "can it actually serve traffic" (used to decide whether to route traffic to it). P5 does not implement these endpoints — that's P3's FastAPI app — but recommends this split since it's a common source of confusing outages otherwise.

## Standalone verification script (P5-owned, no backend dependency)

`infrastructure/health/check_services.py` — run locally after `docker compose up -d` to verify the three data services independently of any application code:

```bash
python3 infrastructure/health/check_services.py
```

Checks:
- PostgreSQL: connects and runs `SELECT 1` + confirms `pgvector` extension is enabled.
- Redis: `PING`.
- MinIO: confirms `contentforge-artifacts` bucket exists via the S3 API.

Exits non-zero with a clear message on first failure — safe to use in CI or a pre-demo smoke test.
