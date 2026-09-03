from typing import AsyncGenerator, Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from app.core.config import settings


# Base class for all SQLAlchemy ORM models
class Base(DeclarativeBase):
    pass


# Sync Engine (for Alembic migrations & synchronous worker tasks)
engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency for synchronous database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Async Engine & Session (for FastAPI async request handling)
async_engine = create_async_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for asynchronous database sessions"""
    async with AsyncSessionLocal() as session:
        yield session
