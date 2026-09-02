# Audit Events (P5 infrastructure, P3 integrates)

> Audit logs are separate from normal application/debug logs (Doc 00 principle #9). They must be append-oriented and not editable through ordinary APIs.

## Fields (every audit record)

```
actor_id
actor_role
event_type
resource_type
resource_id
timestamp
request_id
ip            (where appropriate)
result        (SUCCESS | FAILURE)
metadata      (free-form JSON, event-specific)
```

## Event types (union of Doc 00 §13 and Doc 05 §6 — identical sets, no conflict)

```
LOGIN
LOGIN_FAILED
UPLOAD / FILE_UPLOADED
DELETE / FILE_DELETED
CCO_CREATED
CCO_VERSION_CREATED
TRANSFORMATION_STARTED
TRANSFORMATION_COMPLETED
ARTIFACT_CREATED
ARTIFACT_APPROVED
ARTIFACT_REJECTED
ARTIFACT_REVISED
USER_CREATED
ROLE_CHANGED
CONFIG_CHANGED
PROVENANCE_ANCHORED
```

Note: Doc 00 uses `FILE_UPLOADED`/`FILE_DELETED`, Doc 05 uses `UPLOAD`/`DELETE` for the same events — cosmetic difference, not a contradiction. `infrastructure/audit/events.py` uses the Doc 00 names since they're more specific; P3 can alias if needed.

## Storage

`audit_logs` is a Doc 00 §6 core table — **P3 owns the actual table/migration** since P3 owns application DB models. P5 provides the event-type constants and a payload validator so P3's insert code can't drift from this list. If P3 has not created the table yet, `infrastructure/audit/events.py` still works standalone (validates + shapes the payload) and can log to stdout as structured JSON (see `infrastructure/logging/`) until the table exists — this is the "smallest reasonable implementation" fallback per the top-level instructions.

## Access

Audit logs are readable only via `GET /admin/audit-logs` (admin role — see `docs/RBAC.md`). No update/delete endpoint should ever exist for audit records.
