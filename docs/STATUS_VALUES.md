# Status Values (shared vocabulary)

> Goal: prevent P2/P3/P4 from each inventing their own status strings. This doc **flags a real naming conflict** between two source documents rather than silently picking one — P1/P3 should resolve it before wiring UI/DB against it.

## ⚠️ Conflict found

`documents/00_TEAM_INTEGRATION_CONTRACT.md` §16 defines an **Artifact Lifecycle**:

```
REQUESTED → PROCESSING → GENERATED → VERIFYING → REVIEW → FINALIZED
                                          └── FAILED → REVISION → VERIFYING
```

`documents/03_P3_BACKEND_API.md` §10 defines a **Job Status** (for the transformation job, per that section's heading):

```
QUEUED, PROCESSING, GENERATING, VERIFYING, COMPLETED, FAILED, REVIEW_REQUIRED
```

These may be two *different* state machines (artifact-level status vs. transformation-job status) — that would be a reasonable design. But as written:
- `REQUESTED` (Doc 00) vs `QUEUED` (Doc 03) — same meaning, different word.
- `GENERATED` (Doc 00) vs `GENERATING` (Doc 03) — one is a completed state, one is in-progress; not clearly the same field.
- `REVIEW`/`FINALIZED` (Doc 00) vs `REVIEW_REQUIRED`/`COMPLETED` (Doc 03) — different vocabulary for what looks like the same milestone.
- `REJECTED` and `REVISION_REQUIRED` appear in Doc 00's flow (implicitly, via "REVISION") but Doc 03's job-status list has no rejection state at all.

**P5 is not resolving this** — it's P1 (AI pipeline output) and P3 (persisted status column) who need to agree on one vocabulary. Recommendation: keep them as two explicitly separate, explicitly named fields (`transformation.job_status` using Doc 03's list, `artifact.lifecycle_status` using Doc 00's list) rather than merging into one column — but that decision belongs to P1/P3, not P5.

## Verification states

Per `documents/00_TEAM_INTEGRATION_CONTRACT.md` (VerificationResult entity) and `documents/01_P1_AI_ENGINEER.md`, verification results carry a `status` plus scores — no separate enum conflict was found here, but confirm with P1 before relying on exact string values, since Doc 01 wasn't fully re-derived into this table.

## What P5 needs from status values (for provenance/audit only)

P5's own infrastructure only needs to know:
- **when an artifact is finalized** (to trigger `POST /provenance/{id}/anchor` — see `docs/PROVENANCE.md`), and
- **when an artifact is rejected/revised** (for audit event `ARTIFACT_REJECTED` / `ARTIFACT_REVISED` — see `docs/AUDIT_EVENTS.md`).

Whatever exact string P1/P3 settle on for "finalized" and "rejected", the audit/provenance hooks key off those two milestones — update `infrastructure/audit/events.py` and the provenance trigger point once the conflict above is resolved.
