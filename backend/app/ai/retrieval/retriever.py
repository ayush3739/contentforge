import logging
from typing import Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.embeddings import embed_text
from app.models.chunk import Chunk

logger = logging.getLogger(__name__)


def retrieve_evidence_sync(
    db: Session,
    query: str,
    document_id: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Synchronously retrieves top-k most relevant evidence chunks using pgvector cosine distance.
    """
    query_vector = embed_text(query)

    # Cosine distance ordering: lower distance = higher similarity
    stmt = (
        select(Chunk, Chunk.embedding.cosine_distance(query_vector).label("distance"))
        .where(Chunk.document_id == document_id)
        .order_by("distance")
        .limit(top_k)
    )

    results = db.execute(stmt).all()

    evidence: list[dict[str, Any]] = []
    for chunk, dist in results:
        evidence.append({
            "chunk_id": chunk.id,
            "chunk_index": chunk.chunk_index,
            "text": chunk.text,
            "section": chunk.section,
            "page": chunk.page,
            "similarity_score": round(1.0 - float(dist), 4),
        })

    return evidence


async def retrieve_evidence_async(
    db: AsyncSession,
    query: str,
    document_id: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Asynchronously retrieves top-k most relevant evidence chunks using pgvector cosine distance.
    """
    query_vector = embed_text(query)

    stmt = (
        select(Chunk, Chunk.embedding.cosine_distance(query_vector).label("distance"))
        .where(Chunk.document_id == document_id)
        .order_by("distance")
        .limit(top_k)
    )

    result = await db.execute(stmt)
    rows = result.all()

    evidence: list[dict[str, Any]] = []
    for chunk, dist in rows:
        evidence.append({
            "chunk_id": chunk.id,
            "chunk_index": chunk.chunk_index,
            "text": chunk.text,
            "section": chunk.section,
            "page": chunk.page,
            "similarity_score": round(1.0 - float(dist), 4),
        })

    return evidence


def retrieve_in_memory(
    query: str,
    raw_chunks: list[dict[str, Any]],
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Fast in-memory vector search using dot product on normalized embeddings.
    Used when working with in-memory chunks before or alongside database indexing.
    """
    import numpy as np
    from app.ai.embeddings import embed_batch

    if not raw_chunks:
        return []

    q_emb = np.array(embed_text(query))
    texts = [c["text"] for c in raw_chunks]
    doc_embs = np.array(embed_batch(texts))

    # Dot product of normalized vectors equals cosine similarity
    similarities = np.dot(doc_embs, q_emb)
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        c = raw_chunks[idx]
        results.append({
            "chunk_id": c.get("chunk_id", f"chunk-{idx}"),
            "chunk_index": c.get("chunk_index", idx),
            "text": c.get("text", ""),
            "section": c.get("section", "General"),
            "page": c.get("page", 1),
            "similarity_score": round(float(similarities[idx]), 4),
        })
    return results
