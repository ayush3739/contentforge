#!/usr/bin/env python3
"""
Standalone smoke test for the three local data services (Postgres, Redis,
MinIO), independent of any backend application code.

Owner: P5. Run after `docker compose up -d`:

    python3 infrastructure/health/check_services.py

Requires: psycopg[binary] or psycopg2-binary, redis, boto3 (not vendored —
install in your Python env, or run this inside the backend container once
it exists). Exits non-zero with a clear message on first failure.
"""
from __future__ import annotations

import os
import sys

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/contentforge")
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
STORAGE_ENDPOINT = os.environ.get("STORAGE_ENDPOINT", "http://localhost:9000")
STORAGE_BUCKET = os.environ.get("STORAGE_BUCKET", "contentforge-artifacts")
STORAGE_ACCESS_KEY = os.environ.get("STORAGE_ACCESS_KEY", "minioadmin")
STORAGE_SECRET_KEY = os.environ.get("STORAGE_SECRET_KEY", "minioadmin")


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}")
    sys.exit(1)


def check_postgres() -> None:
    try:
        import psycopg
    except ImportError:
        try:
            import psycopg2 as psycopg  # type: ignore
        except ImportError:
            fail("Neither psycopg nor psycopg2 installed. `pip install psycopg[binary]`")
            return
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=5)  # type: ignore[attr-defined]
        cur = conn.cursor()
        cur.execute("SELECT 1;")
        cur.execute("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
        row = cur.fetchone()
        conn.close()
        if row is None:
            fail("PostgreSQL reachable but 'vector' extension is NOT enabled.")
        print(f"[OK] PostgreSQL reachable, pgvector version {row[1]}")
    except Exception as exc:  # noqa: BLE001
        fail(f"PostgreSQL check failed: {exc}")


def check_redis() -> None:
    try:
        import redis
    except ImportError:
        fail("redis-py not installed. `pip install redis`")
        return
    try:
        client = redis.from_url(REDIS_URL, socket_connect_timeout=5)
        if not client.ping():
            fail("Redis PING returned falsy")
        print("[OK] Redis reachable")
    except Exception as exc:  # noqa: BLE001
        fail(f"Redis check failed: {exc}")


def check_minio() -> None:
    try:
        import boto3
        from botocore.exceptions import ClientError
    except ImportError:
        fail("boto3 not installed. `pip install boto3`")
        return
    try:
        s3 = boto3.client(
            "s3",
            endpoint_url=STORAGE_ENDPOINT,
            aws_access_key_id=STORAGE_ACCESS_KEY,
            aws_secret_access_key=STORAGE_SECRET_KEY,
            region_name="us-east-1",
        )
        s3.head_bucket(Bucket=STORAGE_BUCKET)
        print(f"[OK] MinIO reachable, bucket '{STORAGE_BUCKET}' exists")
    except ClientError as exc:
        fail(f"MinIO bucket check failed: {exc}")
    except Exception as exc:  # noqa: BLE001
        fail(f"MinIO check failed: {exc}")


if __name__ == "__main__":
    check_postgres()
    check_redis()
    check_minio()
    print("All checks passed.")
