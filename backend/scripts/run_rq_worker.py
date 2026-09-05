"""
ContentForge AI — Standalone RQ Worker Process

Executes background jobs from the Redis Queue (RQ) using SimpleWorker.
Compatible with Windows and Linux environments.

Usage:
    uv run python scripts/run_rq_worker.py
    uv run python scripts/run_rq_worker.py --burst
"""

import os
import sys
import logging
import argparse

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rq import SimpleWorker, Queue
from app.core.redis import get_sync_redis_client, is_redis_available

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [RQ-WORKER] %(message)s",
)
logger = logging.getLogger("rq_worker")


def main():
    parser = argparse.ArgumentParser(description="ContentForge RQ Worker")
    parser.add_argument(
        "--burst",
        action="store_true",
        help="Run in burst mode: process all pending jobs and exit",
    )
    parser.add_argument(
        "--queue",
        type=str,
        default="default",
        help="Queue name to listen to (default: 'default')",
    )
    args = parser.parse_args()

    if not is_redis_available():
        logger.error("Redis is offline or unreachable. Please verify REDIS_URL in .env.")
        sys.exit(1)

    client = get_sync_redis_client()
    queue = Queue(args.queue, connection=client)
    mode_str = "burst mode" if args.burst else "continuous polling mode"
    logger.info(f"Starting ContentForge AI RQ Worker on queue '{queue.name}' ({mode_str})...")

    # SimpleWorker is required on Windows as os.fork() is unsupported
    worker = SimpleWorker([queue], connection=client)
    worker.work(burst=args.burst)


if __name__ == "__main__":
    main()
