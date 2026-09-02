"""
Tamper verification: compare a freshly-computed artifact hash against the
hash anchored in the ledger.

Owner: P5. Not wired to any UI — P3/P4 integrate the call. See docs/PROVENANCE.md.
"""
from __future__ import annotations

from typing import Any

from infrastructure.provenance.hashing import hash_bytes
from infrastructure.provenance.ledger import get_ledger
from infrastructure.security.events import SecurityEvent, SecurityEventType, record_event


def verify_artifact(artifact_id: str, current_bytes: bytes) -> dict[str, Any]:
    """
    Recomputes the artifact's SHA-256 and compares it to the hash anchored
    for `artifact_id`. Emits a HASH_MISMATCH security event on failure.

    Returns:
        {"verified": bool, "artifact_hash": str, "expected_hash": str | None, "status": "MATCH" | "MISMATCH" | "NOT_ANCHORED"}
    """
    artifact_hash = hash_bytes(current_bytes)
    record = get_ledger().get(artifact_id)

    if record is None:
        return {
            "verified": False,
            "artifact_hash": artifact_hash,
            "expected_hash": None,
            "status": "NOT_ANCHORED",
        }

    if artifact_hash == record.artifact_hash:
        return {
            "verified": True,
            "artifact_hash": artifact_hash,
            "expected_hash": record.artifact_hash,
            "status": "MATCH",
        }

    record_event(
        SecurityEvent(
            event_type=SecurityEventType.HASH_MISMATCH,
            resource_type="artifact",
            resource_id=artifact_id,
            metadata={"artifact_hash": artifact_hash, "expected_hash": record.artifact_hash},
        )
    )
    return {
        "verified": False,
        "artifact_hash": artifact_hash,
        "expected_hash": record.artifact_hash,
        "status": "MISMATCH",
    }
