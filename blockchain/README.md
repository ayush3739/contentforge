# Blockchain & Provenance Workspace — Person 5 (Blockchain / Provenance)

> **Owner:** P5 (Cloud + Cyber + Blockchain Engineer)  
> **Core Responsibilities:** Hyperledger Fabric Chaincode + Cryptographic Provenance Service + Tamper Verification  
> **Master Specification:** [`documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md`](../documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md)  
> **Team Contract:** [`documents/00_TEAM_INTEGRATION_CONTRACT.md`](../documents/00_TEAM_INTEGRATION_CONTRACT.md)

---

## 🎯 Mission

You build the **tamper-evident provenance verification ledger** for ContentForge AI.
When an artifact is approved and finalized, you compute its canonical cryptographic fingerprint and record it on the Hyperledger Fabric ledger to prove origin, authenticity, and lack of post-generation tampering.

---

## 📁 Recommended Structure

```text
blockchain/
├── contracts/                       # Smart contract / chaincode definitions
│   └── provenance_contract.go       # Hyperledger Fabric chaincode for anchoring artifact hashes
├── client/                          # Fabric SDK or REST gateway client
│   └── fabric_client.py             # Anchors and queries ledger transactions
├── provenance_service.py            # Generates canonical payload, hashes, and validates integrity
└── mocks/                           # In-memory/local mock ledger for testing without full Fabric network
```

---

## 🔗 The Provenance Pipeline

```text
CCO Version ID
      +
Transformation Parameters
      +
Final Artifact File Checksum (SHA-256)
      +
Verification Result Hash
      ↓
Canonical Provenance Payload
      ↓
SHA-256 Hash
      ↓
Anchor to Hyperledger Fabric Ledger
      ↓
Returns Transaction ID & Timestamp
```

---

## ⚠️ Non-Negotiable Rules for Blockchain

1. **Source & Artifact Files Remain Off-Chain**: Never store full PDF, DOCX, or video files on the blockchain. Store files in object storage and only anchor cryptographic hashes (`artifact_hash`, `verification_hash`) to the ledger.
2. **Deterministic Canonical Hashing**: JSON keys and fields in the provenance payload must be sorted deterministically to guarantee reproducible hashes.
3. **Tamper Detection Demo**: Provide an explicit verification endpoint that compares an artifact's live file hash with its ledger record and detects any modification.
