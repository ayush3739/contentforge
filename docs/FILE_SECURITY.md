# File Security Contract

## Pipeline (Doc 00 §21 / Doc 05 §8)

```
Upload
  ↓
MIME validation
  ↓
size validation
  ↓
file safety / malware check
  ↓
quarantine if necessary
  ↓
AI processing (P1)
```

## Rules

- Uploaded files are **untrusted** — treat every upload as hostile until validated.
- Never execute an uploaded file, in any form (no shelling out to convert/preview tools on raw untrusted bytes without sandboxing).
- Do not trust the file extension alone — check actual content type (magic bytes / `python-magic` or equivalent), not just the client-supplied MIME header or filename suffix.
- Enforce a size limit before reading the full file into memory (`MAX_UPLOAD_SIZE_MB`, suggested default 50MB for the hackathon — confirm with P1/P3 given expected source document sizes).
- Storage keys are always server-generated (see `docs/STORAGE_CONTRACT.md`) — the original filename is never used as-is in a path, only as display metadata.
- Uploaded files are stored **privately** (no public bucket URLs) — see Storage Contract §5.

## Validation helper

`infrastructure/security/file_validation.py` provides:
- `validate_mime(data: bytes, allowed: set[str]) -> str` — sniffs actual content type from bytes, raises if not in the allow-list.
- `validate_size(size_bytes: int, max_mb: int) -> None`
- `MALWARE_SCAN_HOOK` — an interface stub (`Callable[[bytes], ScanResult]`) that currently returns "not scanned" by default. **P5 does not implement a full malware scanning platform for the hackathon** (explicitly out of scope per top-level constraints) — this hook exists so ClamAV or a cloud scanning API can be dropped in later without changing call sites.

## Quarantine

For the hackathon, "quarantine" = the file stays under `temporary/` (see Storage Contract) and is never linked to a `document`/`cco` record until it passes validation. No separate quarantine bucket needed at this scale.

## Ownership

P5: this contract + the validation/hook interface. P3: wires it into the actual upload endpoint (`POST /sessions/{id}/documents`). P1: consumes only files that passed this pipeline.
