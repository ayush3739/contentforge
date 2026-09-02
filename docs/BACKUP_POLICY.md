# Backup Policy (hackathon scope)

Not an enterprise backup platform — just enough to not lose the demo.

## PostgreSQL

Backup (run from repo root, requires `docker compose up -d` running):

```bash
docker exec contentforge-db pg_dump -U postgres contentforge > backups/contentforge_$(date +%Y%m%d_%H%M%S).sql
```

Restore:

```bash
cat backups/contentforge_YYYYMMDD_HHMMSS.sql | docker exec -i contentforge-db psql -U postgres contentforge
```

## MinIO / object storage

Backup (mirrors the bucket to a local folder using the `mc` client — install via `docker run` if not present locally):

```bash
docker run --rm --network contentforge-network -v "$(pwd)/backups/minio:/backup" minio/mc:latest sh -c "
  mc alias set local http://minio:9000 minioadmin minioadmin &&
  mc mirror local/contentforge-artifacts /backup
"
```

Restore (reverse mirror):

```bash
docker run --rm --network contentforge-network -v "$(pwd)/backups/minio:/backup" minio/mc:latest sh -c "
  mc alias set local http://minio:9000 minioadmin minioadmin &&
  mc mirror /backup local/contentforge-artifacts
"
```

## Rules

- `backups/` is git-ignored (added in Phase 3) — **never commit backup dumps**, they may contain uploaded source documents.
- Take a backup before any schema-changing migration or before a demo.
- No automated backup schedule for the hackathon — this is a manual, pre-demo safety net, not a production DR plan. Production backup strategy (retention, offsite copies, encryption) is a separate deployment-preparation concern, out of scope here.
