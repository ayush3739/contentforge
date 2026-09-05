from typing import Optional
from pydantic import Field, AliasChoices
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
    # REQUIRED: must be set in .env — e.g. the Neon DB connection string.
    # No default: app will fail at startup with a clear error if DATABASE_URL is missing.
    DATABASE_URL: str

    @property
    def sync_database_url(self) -> str:
        """Ensure standard postgresql connection string for Alembic & Psycopg"""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    # Redis / Upstash (Job Queue & Cache / Upstash)
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    UPSTASH_REDIS_URL: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("UPSTASH_REDIS_URL", "UPSTASH_URL"),
    )
    UPSTASH_REDIS_REST_URL: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("UPSTASH_REDIS_REST_URL", "UPSTASH_REST_URL", "KV_REST_API_URL"),
    )
    UPSTASH_REDIS_REST_TOKEN: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("UPSTASH_REDIS_REST_TOKEN", "UPSTASH_REST_TOKEN", "KV_REST_API_TOKEN"),
    )

    @property
    def effective_redis_url(self) -> str:
        """
        Resolves the active Redis connection URL, prioritizing Upstash:
        1. UPSTASH_REDIS_URL if explicitly provided
        2. Derived rediss:// URL from UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
        3. REDIS_URL if provided
        4. Localhost fallback
        """
        if self.UPSTASH_REDIS_URL:
            return self.UPSTASH_REDIS_URL

        if self.UPSTASH_REDIS_REST_URL and self.UPSTASH_REDIS_REST_TOKEN:
            host = self.UPSTASH_REDIS_REST_URL.replace("https://", "").replace("http://", "").strip("/")
            return f"rediss://default:{self.UPSTASH_REDIS_REST_TOKEN}@{host}:6379"

        if self.REDIS_URL:
            return self.REDIS_URL

        return "redis://localhost:6379/0"

    # AI & LLM (P1) — Provider priority: Groq > Gemini > Grok > OpenAI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GROQ_API_KEY: Optional[str] = None
    GROQ_API_KEY_SECOND: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices(
            "GROQ_API_KEY_SECOND",
            "GROQ_API_KEY_2",
            "GROQ_SECONDARY_API_KEY",
            "GROQ_FALLBACK_API_KEY",
        ),
    )
    GROQ_API_KEYS: Optional[str] = None

    @property
    def groq_api_keys(self) -> list[str]:
        """Returns all configured Groq API keys as a deduplicated list."""
        keys: list[str] = []
        for raw in (self.GROQ_API_KEY, self.GROQ_API_KEY_SECOND, self.GROQ_API_KEYS):
            if raw:
                for k in raw.split(","):
                    k = k.strip()
                    if k and k not in keys:
                        keys.append(k)
        return keys

    GROQ_ROUTER_MODEL: str = "openai/gpt-oss-20b"
    GROQ_GENERATION_MODEL: str = "openai/gpt-oss-120b"
    GROQ_FALLBACK_MODEL: str = "openai/gpt-oss-20b"

    GROQ_SECOND_FALLBACK_MODEL: str = "openai/gpt-oss-120b"
    # xAI Grok configuration
    GROK_API_KEY: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("GROK_API_KEY", "XAI_API_KEY"),
    )
    GROK_MODEL: str = Field(
        default="grok-2-latest",
        validation_alias=AliasChoices("GROK_MODEL", "XAI_MODEL"),
    )
    GROK_FALLBACK_MODEL: Optional[str] = Field(
        default="grok-2",
        validation_alias=AliasChoices("GROK_FALLBACK_MODEL", "XAI_FALLBACK_MODEL"),
    )
    GROK_SECOND_FALLBACK_MODEL: Optional[str] = Field(
        default="grok-beta",
        validation_alias=AliasChoices("GROK_SECOND_FALLBACK_MODEL", "XAI_SECOND_FALLBACK_MODEL"),
    )

    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"
    LLM_PROVIDER: str = "groq"  # groq | gemini | grok | openai

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
