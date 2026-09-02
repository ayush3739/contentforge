"""
Provenance ledger interface, with a JSON-file-backed mock implementation for
PROVENANCE_LEDGER_MOCK=true (the hackathon default).

Owner: P5. See docs/PROVENANCE.md.

A real Hyperledger Fabric client should implement the same `Ledger`
interface (`anchor` / `get`) so it can be swapped in without touching any
caller code — see docs/PROVENANCE.md for what stays out of scope for now.
"""
from __future__ import annotations

import json
import os
import threading
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Protocol


@dataclass(frozen=True)
class ProvenanceRecord:
    artifact_id: str
    cco_version: int
    artifact_hash: str
    verification_status: str
    timestamp: str
    transaction_id: str


class Ledger(Protocol):
    def anchor(self, artifact_id: str, cco_version: int, artifact_hash: str, verification_status: str) -> ProvenanceRecord: ...
    def get(self, artifact_id: str) -> ProvenanceRecord | None: ...


class MockLedger:
    """
    JSON-file-backed mock ledger. NOT for production use — this is what
    PROVENANCE_LEDGER_MOCK=true means. Thread-safe for single-process use.
    """

    def __init__(self, path: str | Path = "infrastructure/provenance/.mock_ledger.json"):
        self._path = Path(path)
        self._lock = threading.Lock()
        if not self._path.exists():
            self._path.parent.mkdir(parents=True, exist_ok=True)
            self._path.write_text("{}", encoding="utf-8")

    def _read(self) -> dict:
        return json.loads(self._path.read_text(encoding="utf-8") or "{}")

    def _write(self, data: dict) -> None:
        self._path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def anchor(self, artifact_id: str, cco_version: int, artifact_hash: str, verification_status: str) -> ProvenanceRecord:
        with self._lock:
            data = self._read()
            tx_id = f"mock-tx-{len(data) + 1:06d}"
            record = ProvenanceRecord(
                artifact_id=artifact_id,
                cco_version=cco_version,
                artifact_hash=artifact_hash,
                verification_status=verification_status,
                timestamp=datetime.now(timezone.utc).isoformat(),
                transaction_id=tx_id,
            )
            data[artifact_id] = asdict(record)
            self._write(data)
            return record

    def get(self, artifact_id: str) -> ProvenanceRecord | None:
        data = self._read()
        raw = data.get(artifact_id)
        return ProvenanceRecord(**raw) if raw else None


_ledger: Ledger | None = None


def get_ledger() -> Ledger:
    """
    Returns the configured ledger. Only the mock is implemented today —
    PROVENANCE_LEDGER_MOCK=false will raise until real Fabric integration
    lands (explicitly out of scope for this phase, see docs/PROVENANCE.md).
    """
    global _ledger
    if _ledger is not None:
        return _ledger
    mock_enabled = os.environ.get("PROVENANCE_LEDGER_MOCK", "true").lower() == "true"
    if not mock_enabled:
        raise NotImplementedError(
            "PROVENANCE_LEDGER_MOCK=false but no real Hyperledger Fabric client is implemented yet. "
            "See docs/PROVENANCE.md."
        )
    _ledger = MockLedger()
    return _ledger
