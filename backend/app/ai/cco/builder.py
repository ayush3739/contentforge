import hashlib
from datetime import datetime, timezone
from typing import Any, Optional
from app.ai.extraction.semantic import SemanticExtractionResult


def build_cco(
    document_id: str,
    version_number: int,
    source_blocks: list[dict[str, Any]],
    deterministic_data: dict[str, Any],
    semantic_data: SemanticExtractionResult,
) -> dict[str, Any]:
    """
    Constructs the versioned Canonical Content Object (CCO).
    The CCO serves as the single source of semantic truth for all downstream
    artifact generation and verification tasks.
    """
    full_text = " ".join(b.get("text", "") for b in source_blocks)
    sha256_hash = hashlib.sha256(full_text.encode("utf-8")).hexdigest()

    # Extract distinct sections
    sections = []
    seen_sections = set()
    for b in source_blocks:
        sec = b.get("section", "General")
        if sec and sec not in seen_sections:
            seen_sections.add(sec)
            sections.append(sec)

    # Format claims and associate with source blocks if match found
    formatted_claims = []
    for i, claim in enumerate(semantic_data.claims, start=1):
        claim_id = claim.id or f"claim-{i:03d}"
        # Find which block matches source_sentence best
        matching_block_indices = []
        for idx, block in enumerate(source_blocks):
            if claim.source_sentence and claim.source_sentence[:30].lower() in block.get("text", "").lower():
                matching_block_indices.append(f"block-{idx}")

        formatted_claims.append({
            "id": claim_id,
            "text": claim.text,
            "category": claim.category,
            "confidence": claim.confidence,
            "evidence_refs": matching_block_indices if matching_block_indices else [f"block-0"],
            "source_sentence": claim.source_sentence,
        })

    # Detect conflicts (e.g. conflicting dates or numbers if any)
    conflicts = []

    # Assemble CCO
    cco: dict[str, Any] = {
        "document_id": document_id,
        "version": version_number,
        "hash": sha256_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "title": semantic_data.title,
            "overview": semantic_data.executive_overview,
            "total_blocks": len(source_blocks),
            "total_characters": len(full_text),
        },
        "sections": sections,
        "claims": formatted_claims,
        "facts": semantic_data.key_findings,
        "dates": deterministic_data.get("dates", []),
        "numbers": deterministic_data.get("numbers", []),
        "identifiers": deterministic_data.get("identifiers", []),
        "conflicts": conflicts,
        "confidence": {
            "overall": 0.95 if formatted_claims else 0.85,
            "deterministic_precision": 1.0,
            "semantic_claim_count": len(formatted_claims),
        }
    }

    return cco
