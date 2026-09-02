"""
Startup environment validation — fail fast and loudly if critical config is
missing, instead of a confusing failure three layers deep at request time.

Owner: P5. Call `validate_critical_env()` once at process startup (backend
and worker entrypoints — P3 wires the actual call site).
"""
from __future__ import annotations

import os

CRITICAL_VARS = (
    "DATABASE_URL",
    "REDIS_URL",
    "STORAGE_ENDPOINT",
    "STORAGE_BUCKET",
    "STORAGE_ACCESS_KEY",
    "STORAGE_SECRET_KEY",
    "JWT_SECRET",
)


class MissingEnvironmentError(RuntimeError):
    def __init__(self, missing: list[str]):
        self.missing = missing
        super().__init__(f"Missing critical environment variables: {', '.join(missing)}")


def validate_critical_env(env: dict[str, str] | None = None) -> None:
    """Raises MissingEnvironmentError listing every missing critical var (not just the first)."""
    source = env if env is not None else os.environ
    missing = [name for name in CRITICAL_VARS if not source.get(name)]
    if missing:
        raise MissingEnvironmentError(missing)
