"""
Deterministic SHA-256 hashing for provenance payloads and artifact bytes.

Owner: P5. See docs/PROVENANCE.md.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any, BinaryIO


def hash_bytes(data: bytes) -> str:
    """SHA-256 hex digest of raw bytes."""
    return hashlib.sha256(data).hexdigest()


def hash_file(fileobj: BinaryIO, chunk_size: int = 1024 * 1024) -> str:
    """SHA-256 hex digest of a file-like object, read in chunks (safe for large artifacts)."""
    h = hashlib.sha256()
    while True:
        chunk = fileobj.read(chunk_size)
        if not chunk:
            break
        h.update(chunk)
    return h.hexdigest()


def canonical_json(payload: dict[str, Any]) -> bytes:
    """
    Deterministic JSON serialization: sorted keys, no extra whitespace.
    Two payloads with the same logical content always produce identical bytes,
    which is required for the hash to be reproducible/verifiable later.
    """
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def build_provenance_payload(
    *,
    cco_version: int,
    transformation_parameters: dict[str, Any],
    artifact_hash: str,
    verification_result: dict[str, Any],
) -> dict[str, Any]:
    """Assembles the canonical provenance payload described in docs/PROVENANCE.md."""
    return {
        "cco_version": cco_version,
        "transformation_parameters": transformation_parameters,
        "artifact_hash": artifact_hash,
        "verification_result": verification_result,
    }


def hash_provenance_payload(payload: dict[str, Any]) -> str:
    return hash_bytes(canonical_json(payload))
