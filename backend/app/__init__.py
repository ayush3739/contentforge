"""
ContentForge AI — Application Package

This package contains the core FastAPI application modules:
- api/: HTTP endpoints and route handlers
- core/: Configuration, database connection, and security utilities
- models/: SQLAlchemy ORM database models
- schemas/: Pydantic v2 validation models
- services/: Business logic and orchestration services
- ai/: P1 AI pipeline (CCO, RAG, prompt compilation, verification)
- renderers/: P4 artifact renderers (PPTX, DOCX, HTML)
- jobs/: Redis async task orchestration
- storage/: MinIO/S3 object storage client
- audit/: Audit logging and security events
"""
