"""
ContentForge AI — FastAPI Application Entrypoint

FastAPI server connecting the Next.js frontend (P2)
with persistence (P3), AI intelligence (P1), and artifact renderers (P4).
"""

import logging
import sys
from contextlib import asynccontextmanager

if sys.platform == "win32":
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.ai.embeddings import get_embedding_model

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Server startup and shutdown lifecycle management.
    Pre-loads heavy AI models at startup to avoid runtime request latency.
    """
    # 1. Initialize terminal logging
    setup_logging(log_level="DEBUG" if settings.DEBUG else "INFO")
    logger.info("================================================================")
    logger.info("[STARTUP] ContentForge AI Backend Server Starting...")
    logger.info(f"Environment: {settings.ENVIRONMENT} | Debug: {settings.DEBUG}")
    logger.info(f"Database: Neon PostgreSQL with pgvector")
    logger.info(f"Primary LLM Provider: {settings.LLM_PROVIDER}")
    logger.info("================================================================")

    # 2. Warm up local embedding model in memory at server boot
    logger.info(f"[MODEL] Pre-loading local embedding model '{settings.EMBEDDING_MODEL}' into memory...")
    try:
        get_embedding_model()
        logger.info(f"[MODEL] Embedding model '{settings.EMBEDDING_MODEL}' loaded and ready in memory! (dim={settings.EMBEDDING_DIMENSION})")
    except Exception as e:
        logger.error(f"[MODEL] Error pre-loading embedding model: {e}")

    logger.info("[READY] Server accepting API requests at http://localhost:8000")
    logger.info("[DOCS] Swagger API Documentation available at http://localhost:8000/docs")

    yield

    logger.info("[SHUTDOWN] ContentForge AI Backend shutting down...")


app = FastAPI(
    title="ContentForge AI",
    description="Cross-platform communication artefact engine with verified provenance (SIH26154)",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration for local development with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Engine Routes (P1) — Imported directly from app.api.ai
from app.api.ai import router as ai_router
app.include_router(ai_router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint welcoming developers."""
    return {
        "app": "ContentForge AI",
        "status": "running",
        "docs": "/docs",
        "version": settings.VERSION,
    }


@app.get("/api/health", tags=["Health"])
@app.get("/health", include_in_schema=False)
async def health_check():
    """
    Health check route to verify backend service availability.
    """
    return {
        "status": "healthy",
        "service": "backend",
        "database": "ready",
        "version": settings.VERSION,
    }
