import pytest

from infrastructure.provenance import ledger as ledger_module
from infrastructure.provenance.verify import verify_artifact


@pytest.fixture(autouse=True)
def isolated_mock_ledger(monkeypatch, tmp_path):
    """Point the mock ledger at a throwaway file so tests don't touch the real one."""
    ledger_path = tmp_path / "mock_ledger.json"
    monkeypatch.setenv("PROVENANCE_LEDGER_MOCK", "true")
    ledger_module._ledger = ledger_module.MockLedger(path=ledger_path)
    yield
    ledger_module._ledger = None


def test_verify_not_anchored_when_no_record_exists():
    result = verify_artifact("artifact-does-not-exist", b"some bytes")
    assert result["status"] == "NOT_ANCHORED"
    assert result["verified"] is False


def test_verify_match_when_bytes_unchanged():
    artifact_bytes = b"final artifact content v1"
    ledger_module.get_ledger().anchor(
        artifact_id="artifact-1",
        cco_version=1,
        artifact_hash=__import__("infrastructure.provenance.hashing", fromlist=["hash_bytes"]).hash_bytes(artifact_bytes),
        verification_status="PASSED",
    )
    result = verify_artifact("artifact-1", artifact_bytes)
    assert result["status"] == "MATCH"
    assert result["verified"] is True


def test_verify_mismatch_when_bytes_tampered():
    from infrastructure.provenance.hashing import hash_bytes

    original_bytes = b"final artifact content v1"
    tampered_bytes = b"final artifact content v1 -- TAMPERED"

    ledger_module.get_ledger().anchor(
        artifact_id="artifact-2",
        cco_version=1,
        artifact_hash=hash_bytes(original_bytes),
        verification_status="PASSED",
    )
    result = verify_artifact("artifact-2", tampered_bytes)
    assert result["status"] == "MISMATCH"
    assert result["verified"] is False
    assert result["artifact_hash"] != result["expected_hash"]
