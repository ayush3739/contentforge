import io
import logging
import hashlib
from typing import Any, Optional, Union
from app.core.config import settings

logger = logging.getLogger(__name__)

_model_instance = None
_gemini_client = None


def get_embedding_model():
    """
    Lazy-loads and returns the singleton SentenceTransformer model for TEXT embeddings.
    Loads once into memory and is reused across all text requests.
    """
    global _model_instance
    if _model_instance is None:
        logger.info(f"Loading local text embedding model: {settings.EMBEDDING_MODEL} (dim={settings.EMBEDDING_DIMENSION})")
        from sentence_transformers import SentenceTransformer
        _model_instance = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model_instance


def embed_text(text: str) -> list[float]:
    """
    Generates a 384-dimensional dense vector embedding for a single text using SentenceTransformer.
    Returns a Python list of floats ready for pgvector storage/querying.
    """
    model = get_embedding_model()
    # Normalize embeddings for cosine similarity
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a batch of texts in a single pass using SentenceTransformer.
    """
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(texts, batch_size=32, normalize_embeddings=True)
    return [e.tolist() for e in embeddings]


def get_gemini_client():
    """
    Lazy-loads and returns the Google GenAI client for multimodal/image embeddings.
    """
    global _gemini_client
    if _gemini_client is None and getattr(settings, "GEMINI_API_KEY", None):
        try:
            from google import genai
            _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize google-genai client for image embeddings: {e}")
            _gemini_client = None
    return _gemini_client


def embed_image(
    image_input: Union[bytes, Any],
    output_dim: int = 384,
    mime_type: str = "image/png",
) -> list[float]:
    """
    Generates a dense vector embedding STRICTLY for image inputs using Google Gemini multimodal embedding.
    This is invoked exclusively when the input is an image (e.g. diagrams, charts, figures).
    Accepts raw image bytes or a PIL.Image.Image instance.
    Uses 'models/gemini-embedding-2' with configured output_dimensionality (default 384 for pgvector).
    """
    client = get_gemini_client()
    if client is not None:
        try:
            from google.genai import types
            from PIL import Image

            if isinstance(image_input, bytes):
                pil_img = Image.open(io.BytesIO(image_input))
            elif hasattr(image_input, "save"):
                pil_img = image_input
            else:
                raise ValueError("Unsupported image input type; expected bytes or PIL.Image")

            cfg = types.EmbedContentConfig(output_dimensionality=output_dim)
            res = client.models.embed_content(
                model="models/gemini-embedding-2",
                contents=pil_img,
                config=cfg,
            )
            if hasattr(res, "embeddings") and res.embeddings:
                return [float(v) for v in res.embeddings[0].values]
        except Exception as exc:
            logger.warning(f"[GEMINI-IMAGE-EMBED] Failed to generate Gemini image embedding: {exc}. Using deterministic projection.")

    # Deterministic fallback vector if Gemini is offline or API key missing
    if isinstance(image_input, bytes):
        raw_bytes = image_input
    elif hasattr(image_input, "tobytes"):
        raw_bytes = image_input.tobytes()
    else:
        raw_bytes = str(image_input).encode("utf-8")

    import math
    seed = hashlib.sha256(raw_bytes).digest()
    vec = []
    for i in range(output_dim):
        byte_val = seed[i % len(seed)]
        val = math.sin((i + 1) * (byte_val + 1))
        vec.append(val)
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [round(x / norm, 6) for x in vec]


def embed_images_batch(
    images: list[Union[bytes, Any]],
    output_dim: int = 384,
) -> list[list[float]]:
    """
    Generates embeddings for a batch of images using Google Gemini multimodal embedding.
    Strictly for image inputs.
    """
    return [embed_image(img, output_dim=output_dim) for img in images]
