# Security Events (P5 infrastructure, P1/P3 emit into it)

## Event types

```
PROMPT_INJECTION_DETECTED
MALICIOUS_FILE_DETECTED
UNAUTHORIZED_ACCESS
INVALID_TOKEN
RATE_LIMIT_EXCEEDED
SUSPICIOUS_REQUEST
OUTPUT_VALIDATION_FAILED
HASH_MISMATCH
```

(`HASH_MISMATCH` added by P5 — not explicitly listed in Doc 00/05's security event lists, but needed for the tamper-verification flow in `docs/PROVENANCE.md` Phase 17. Documenting the addition here so it isn't a silent extension.)

## Ownership split (from Doc 00 §14 / Doc 05 §7/§9)

| Layer | Owner | Responsibility |
|---|---|---|
| Detection/mitigation logic (e.g. actually spotting a prompt-injection attempt in source text) | **P1** | AI-level defenses |
| Event infrastructure (schema, storage, request tracing, rate-limit mechanics, least-privilege config) | **P5** | this doc + `infrastructure/security/` |
| API-level integration (calling `record_security_event()` from the right FastAPI middleware/handler) | **P3** | wiring into actual endpoints |

P5 does not detect prompt injection or malicious files itself — it defines the event shape and gives P1/P3 a validated way to record one.

## Fields

Same shape as audit events (`docs/AUDIT_EVENTS.md`) plus a `severity`:

```
event_type
severity        (LOW | MEDIUM | HIGH | CRITICAL)
actor_id        (nullable — an unauthenticated request can still trigger e.g. RATE_LIMIT_EXCEEDED)
resource_type / resource_id
request_id
ip
timestamp
metadata
```

## Storage

`security_events` is a Doc 00 §6 core table, owned by P3 for persistence — same "P5 provides validated event + fallback stdout sink" pattern as audit events. See `infrastructure/security/events.py`.

## Access

`GET /admin/security-events` — admin role only.
