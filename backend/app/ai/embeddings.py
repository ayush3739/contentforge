import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

_model_instance = None


def get_embedding_model():
    """
    Lazy-loads and returns the singleton SentenceTransformer model.
    Loads once into memory and is reused across all requests.
    """
    global _model_instance
    if _model_instance is None:
        logger.info(f"Loading local embedding model: {settings.EMBEDDING_MODEL} (dim={settings.EMBEDDING_DIMENSION})")
        from sentence_transformers import SentenceTransformer
        _model_instance = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model_instance


def embed_text(text: str) -> list[float]:
    """
    Generates a 384-dimensional dense vector embedding for a single text.
    Returns a Python list of floats ready for pgvector storage/querying.
    """
    model = get_embedding_model()
    # Normalize embeddings for cosine similarity
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a batch of texts in a single pass.
    """
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(texts, batch_size=32, normalize_embeddings=True)
    return [e.tolist() for e in embeddings]
