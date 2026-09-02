"""
Core Package — Application Foundation & Infrastructure

This package contains system-wide foundations:
- config.py: Pydantic BaseSettings loading environment variables from .env
- database.py: SQLAlchemy async engine, sessionmaker, and pgvector base
- security.py: Password hashing (bcrypt) and JWT token creation/validation
- rbac.py: Role-based access control dependencies (require_user, require_role)
"""
