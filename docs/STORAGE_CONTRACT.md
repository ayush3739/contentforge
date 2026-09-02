# Storage Contract (P5)

> Owner: P5. Consumers: P3 (persists metadata), P4 (writes artifacts), P1 (writes source-derived intermediates if any).

## 1. Rule

Large binary files (source uploads, generated artifacts, previews) are **never** stored in PostgreSQL.
PostgreSQL stores only the metadata pointer below; the bytes live in object storage (MinIO locally, S3-compatible in production).

## 2. Bucket

```
STORAGE_BUCKET=contentforge-artifacts
```

Single bucket for the hackathon. Logical separation is done via key prefixes, not separate buckets.

## 3. Key conventions

```
sources/{document_id}/{version}/source.{ext}
artifacts/{artifact_id}/{version}/artifact.{ext}
artifacts/{artifact_id}/{version}/preview.pdf
temporary/{session_id}/{uuid}.{ext}
```

Rules:
- `{document_id}`, `{artifact_id}`, `{session_id}` must be server-generated UUIDs — **never** derived from user-supplied filenames.
- `{version}` is an integer, starting at `1`, immutable once written (new version = new key, old key is retained).
- `temporary/` keys are for in-flight uploads/renders and should be cleaned up by a scheduled job (P3/worker owns the job; P5 documents the convention here).
- No key may contain `..`, a leading `/`, or raw user input — see `infrastructure/storage/keys.py` for the generator + validator that enforces this (path traversal test in `tests/p5/`).

## 4. Metadata P3 must persist (in PostgreSQL, not object storage)

```
artifact_id / document_id
version
artifact_type / mime_type
storage_key
checksum        (sha256, hex)
size            (bytes)
status
created_at
```

## 5. Access

- Local dev: MinIO console at `localhost:9001` (minioadmin/minioadmin), API at `localhost:9000`.
- Objects are **private by default** — no public bucket policy. Downloads go through a backend-issued pre-signed URL or an authenticated proxy endpoint (P3 owns the endpoint; P5 owns the storage client that can mint the signed URL).
- Do not generate long-lived public URLs for uploaded source files (they may contain sensitive organizational data).

## 6. Reusable client

`infrastructure/storage/client.py` provides a thin boto3-based S3 client pre-configured for the MinIO endpoint, plus the key-generation helpers in `infrastructure/storage/keys.py`. Backend/worker code should import from here rather than re-implementing S3 config.

## 7. Non-goals (not implemented by P5 here)

- Actual artifact generation (P4).
- Actual upload API endpoint (P3) — this doc only defines the contract it must follow.
