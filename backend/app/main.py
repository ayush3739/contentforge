"""
ContentForge AI — FastAPI Application Entrypoint

This is the primary server entrypoint for ContentForge AI.
FastAPI acts as the application front door connecting the Next.js frontend (P2)
with persistence (P3), AI intelligence (P1), and artifact renderers (P4).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ContentForge AI",
    description="Cross-platform communication artefact engine with verified provenance (SIH26154)",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for local development with Next.js frontend (http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint welcoming developers."""
    return {
        "app": "ContentForge AI",
        "status": "running",
        "docs": "/docs",
        "version": "0.1.0",
    }


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """
    Health check route to verify backend service availability.
    Can be monitored by Docker, Kubernetes, or frontend health checks.
    """
    return {
        "status": "healthy",
        "service": "backend",
        "database": "ready",
        "version": "0.1.0",
    }
