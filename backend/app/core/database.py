import logging
import socket
import time
from typing import AsyncGenerator, Generator, Optional
from urllib.parse import urlparse
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from app.core.config import settings

logger = logging.getLogger("app.core.database")


# Base class for all SQLAlchemy ORM models
class Base(DeclarativeBase):
    pass


# Sync Engine (for Alembic migrations & synchronous worker tasks)
engine = create_engine(
    settings.sync_database_url,
    pool_pre_ping=True,
    echo=False,
    connect_args={"connect_timeout": 10} if "postgresql" in settings.sync_database_url else {},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

_db_reachable: Optional[bool] = None
_db_last_checked: float = 0.0


def is_database_reachable() -> bool:
    """Quick socket check to verify if the PostgreSQL host is reachable, avoiding long hangs."""
    global _db_reachable, _db_last_checked
    now = time.time()
    if _db_reachable is not None and (now - _db_last_checked < 30.0):
        return _db_reachable

    parsed = urlparse(settings.sync_database_url)
    if "postgresql" in parsed.scheme:
        host = parsed.hostname or "127.0.0.1"
        port = parsed.port or 5432
        try:
            sock = socket.create_connection((host, port), timeout=2.0)
            sock.close()
            _db_reachable = True
        except (socket.timeout, ConnectionRefusedError, OSError):
            _db_reachable = False
    else:
        _db_reachable = True

    _db_last_checked = now
    return _db_reachable


def get_db() -> Generator[Optional[Session], None, None]:
    """Dependency for synchronous database sessions. Yields None if database is unreachable."""
    if not is_database_reachable():
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    except Exception as exc:
        logger.warning(f"Database session error: {exc}")
        db.rollback()
        raise
    finally:
        try:
            db.close()
        except Exception:
            pass


def new_db_session() -> Session:
    """Creates a fresh independent DB session for use in background jobs.
    Caller is responsible for commit/rollback/close."""
    return SessionLocal()


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
