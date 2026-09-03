"""
ContentForge AI — V1 Master Router Registration

Bundles all Version 1 API endpoint modules:
- /api/v1/auth
- /api/v1/sessions
- /api/v1/documents
- /api/v1/transformations
- /api/v1/artifacts
- /api/v1/review
- /api/v1/admin
"""

from fastapi import APIRouter
from app.api.v1.admin import router as admin_router
from app.api.v1.artifacts import router as artifacts_router
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.review import router as review_router
from app.api.v1.sessions import router as sessions_router
from app.api.v1.transformations import router as transformations_router

router_v1 = APIRouter(prefix="/api/v1")

router_v1.include_router(auth_router)
router_v1.include_router(sessions_router)
router_v1.include_router(documents_router)
router_v1.include_router(transformations_router)
router_v1.include_router(artifacts_router)
router_v1.include_router(review_router)
router_v1.include_router(admin_router)
