"""
API Layer Package — ContentForge AI
Direct endpoint routers (no extra v1 nesting).
"""

from app.api.ai import router as ai_router

__all__ = ["ai_router"]
