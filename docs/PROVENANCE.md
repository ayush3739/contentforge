# Provenance & Tamper Verification

## Principle (Doc 00 §21 / Doc 05 §11)

Source files and artifacts stay **off-chain**, in object storage. Only a small hash/metadata record goes on-chain (or, for the hackathon, into a mock local ledger — `PROVENANCE_LEDGER_MOCK=true`).

## Canonical provenance payload

```
CCO version
+ transformation parameters
+ final artifact bytes
+ verification result
  ↓
canonical provenance payload (deterministic JSON)
  ↓
SHA-256
  ↓
Hyperledger Fabric (real) / mock ledger (hackathon)
```

## On-chain fields

```
artifact_id
cco_version
artifact_hash
verification_status / verification_hash
timestamp
transaction_id
```

## Implementation status

- **Implemented now:** `infrastructure/provenance/hashing.py` (deterministic SHA-256 of bytes or of a canonical JSON payload) and `infrastructure/provenance/verify.py` (compare current hash vs. stored/ledger hash → MATCH/MISMATCH).
- **Mocked now:** `infrastructure/provenance/ledger.py` — a `MockLedger` that stores `{artifact_id: {hash, timestamp}}` in-process/JSON-file when `PROVENANCE_LEDGER_MOCK=true`. Same interface a real Hyperledger Fabric client would implement (`anchor(record) -> tx_id`, `get(artifact_id) -> record`), so swapping in real Fabric later is a drop-in replacement, not a rewrite.
- **Not implemented (explicitly out of scope for this phase):** actual Hyperledger Fabric network setup, chaincode, gRPC client. `BLOCKCHAIN_RPC_URL` / `BLOCKCHAIN_CONTRACT_ID` env vars are reserved for that future work.

## Trigger point

`POST /provenance/{artifact_id}/anchor` (P3-owned endpoint, per `docs/API_CONTRACT.md`) should call `infrastructure/provenance/hashing.py` + `ledger.py` once an artifact reaches its "finalized" status — see the open naming question in `docs/STATUS_VALUES.md` for exactly which status string that is.

## Tamper verification (Phase 17)

```
final artifact bytes
  ↓
SHA-256
  ↓
compare with stored/ledger hash
  ↓
MATCH / MISMATCH
```

`infrastructure/provenance/verify.py::verify_artifact()` returns:

```json
{"verified": true,  "artifact_hash": "...", "expected_hash": "...", "status": "MATCH"}
{"verified": false, "artifact_hash": "...", "expected_hash": "...", "status": "MISMATCH"}
```

On `MISMATCH`, callers should also emit a `HASH_MISMATCH` security event (see `docs/SECURITY_EVENTS.md`) — `verify_artifact()` does this automatically. This is not wired to any UI; P3/P4 integrate the call where appropriate.
