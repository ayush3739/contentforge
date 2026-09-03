import logging
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.embeddings import embed_batch
from app.models.chunk import Chunk

logger = logging.getLogger(__name__)


def index_chunks_sync(
    db: Session,
    document_id: str,
    raw_chunks: list[dict[str, Any]],
) -> list[Chunk]:
    """
    Synchronous chunk indexer for background worker or migration scripts.
    Generates embeddings locally and writes records to pgvector.
    """
    if not raw_chunks:
        return []

    texts = [c["text"] for c in raw_chunks]
    logger.info(f"Generating embeddings for {len(texts)} chunks using local model...")
    embeddings = embed_batch(texts)

    chunk_models: list[Chunk] = []
    for raw, emb in zip(raw_chunks, embeddings):
        chunk_obj = Chunk(
            document_id=document_id,
            text=raw["text"],
            section=raw.get("section"),
            page=raw.get("page"),
            chunk_index=raw.get("chunk_index", 0),
            token_count=raw.get("token_count"),
            metadata_json=raw.get("metadata", {}),
            embedding=emb,
        )
        chunk_models.append(chunk_obj)
        db.add(chunk_obj)

    db.commit()
    logger.info(f"Successfully indexed {len(chunk_models)} chunks into pgvector.")
    return chunk_models


async def index_chunks_async(
    db: AsyncSession,
    document_id: str,
    raw_chunks: list[dict[str, Any]],
) -> list[Chunk]:
    """
    Asynchronous chunk indexer for FastAPI request lifecycle.
    """
    if not raw_chunks:
        return []

    texts = [c["text"] for c in raw_chunks]
    embeddings = embed_batch(texts)

    chunk_models: list[Chunk] = []
    for raw, emb in zip(raw_chunks, embeddings):
        chunk_obj = Chunk(
            document_id=document_id,
            text=raw["text"],
            section=raw.get("section"),
            page=raw.get("page"),
            chunk_index=raw.get("chunk_index", 0),
            token_count=raw.get("token_count"),
            metadata_json=raw.get("metadata", {}),
            embedding=emb,
        )
        chunk_models.append(chunk_obj)
        db.add(chunk_obj)

    await db.commit()
    return chunk_models
