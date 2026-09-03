from typing import Any


def chunk_blocks(
    source_blocks: list[dict[str, Any]],
    target_tokens: int = 400,
    overlap_tokens: int = 60,
) -> list[dict[str, Any]]:
    """
    Groups layout blocks into semantic chunks with target size and overlap.
    Preserves page numbers, source section names, and block IDs for exact evidence citation.
    Rough token approximation: 1 token ~ 4 characters.
    """
    target_chars = target_tokens * 4
    overlap_chars = overlap_tokens * 4

    chunks: list[dict[str, Any]] = []
    current_chunk_blocks: list[dict[str, Any]] = []
    current_chars = 0
    chunk_index = 0

    def create_chunk():
        nonlocal chunk_index
        if not current_chunk_blocks:
            return

        text = " ".join(b.get("text", "") for b in current_chunk_blocks).strip()
        first_block = current_chunk_blocks[0]
        last_block = current_chunk_blocks[-1]
        pages = list({b.get("page", 1) for b in current_chunk_blocks if b.get("page")})

        chunks.append({
            "chunk_id": f"chunk-{chunk_index:03d}",
            "chunk_index": chunk_index,
            "text": text,
            "section": first_block.get("section", "General"),
            "page": pages[0] if pages else 1,
            "pages": pages,
            "block_ids": [f"block-{b.get('position', 0)}" for b in current_chunk_blocks],
            "token_count": len(text) // 4,
            "metadata": {
                "start_block": first_block.get("position", 0),
                "end_block": last_block.get("position", 0),
            }
        })
        chunk_index += 1

    for block in source_blocks:
        b_text = block.get("text", "")
        b_len = len(b_text)

        if current_chars + b_len > target_chars and current_chunk_blocks:
            create_chunk()

            # Handle overlap: keep trailing blocks within overlap_chars
            overlap_blocks = []
            overlap_accum = 0
            for prev_b in reversed(current_chunk_blocks):
                p_len = len(prev_b.get("text", ""))
                if overlap_accum + p_len <= overlap_chars:
                    overlap_blocks.insert(0, prev_b)
                    overlap_accum += p_len
                else:
                    break
            current_chunk_blocks = overlap_blocks
            current_chars = overlap_accum

        current_chunk_blocks.append(block)
        current_chars += b_len

    # Final trailing chunk
    if current_chunk_blocks:
        create_chunk()

    return chunks
