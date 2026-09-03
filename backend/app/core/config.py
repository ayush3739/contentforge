from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "ContentForge AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "contentforge-dev-secret-key-replace-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database (PostgreSQL + pgvector / Neon DB)
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/contentforge"

    @property
    def sync_database_url(self) -> str:
        """Ensure standard postgresql connection string for Alembic & Psycopg"""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    # Redis (Job Queue & Cache / Upstash)
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI & LLM (P1) — Provider priority: Gemini > Groq > OpenAI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GROQ_API_KEY: Optional[str] = None
    GROQ_ROUTER_MODEL: str = "openai/gpt-oss-20b"
    GROQ_GENERATION_MODEL: str = "openai/gpt-oss-120b"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    LLM_PROVIDER: str = "groq"  # groq | gemini | openai

    # Embeddings (P1) — Local sentence-transformers, zero-cost & offline
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    EMBEDDING_PROVIDER: str = "local"  # local | openai | gemini

    # Object Storage (P4 & P5 / MinIO, Supabase, Cloudflare R2, AWS S3, Local)
    STORAGE_PROVIDER: str = "local"  # local | minio | s3 | supabase
    STORAGE_ENDPOINT: Optional[str] = "http://localhost:9000"
    STORAGE_BUCKET: str = "contentforge-artifacts"
    STORAGE_ACCESS_KEY: Optional[str] = "minioadmin"
    STORAGE_SECRET_KEY: Optional[str] = "minioadmin"
    STORAGE_REGION: str = "us-east-1"
    LOCAL_STORAGE_PATH: str = "./storage_data"

    # Clerk Authentication
    CLERK_SECRET_KEY: Optional[str] = None
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    CLERK_JWKS_URL: Optional[str] = None
    CLERK_ISSUER: Optional[str] = None

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
