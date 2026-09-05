"""
ContentForge AI — Redis Connection, RQ Queue & Pub/Sub Client

Provides connection management, health checks, RQ queue initialization,
and Redis Pub/Sub streaming with seamless in-memory fallback.
"""

import asyncio
import json
import logging
import time
from typing import Any, AsyncGenerator, Optional
from urllib.parse import urlparse
import redis
import redis.asyncio as aioredis
from rq import Queue

from app.core.config import settings

logger = logging.getLogger("app.core.redis")

_redis_sync_client: Optional[redis.Redis] = None
_redis_async_client: Optional[aioredis.Redis] = None
_upstash_rest_client: Optional[Any] = None
_last_health_check_time: float = 0.0
_cached_availability: bool = False
_HEALTH_CACHE_TTL = 5.0  # seconds


class InMemoryEventBus:
    """
    Lightweight in-memory event bus providing pub/sub fallback
    when a Redis server is offline or in local unit testing.
    """

    def __init__(self):
        self._subscribers: dict[str, set[asyncio.Queue]] = {}

    def publish(self, channel: str, message: dict):
        if channel in self._subscribers:
            for q in list(self._subscribers[channel]):
                try:
                    q.put_nowait(message)
                except asyncio.QueueFull:
                    pass

    def subscribe(self, channel: str) -> asyncio.Queue:
        if channel not in self._subscribers:
            self._subscribers[channel] = set()
        q: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers[channel].add(q)
        return q

    def unsubscribe(self, channel: str, q: asyncio.Queue):
        if channel in self._subscribers and q in self._subscribers[channel]:
            self._subscribers[channel].remove(q)
            if not self._subscribers[channel]:
                del self._subscribers[channel]


in_memory_bus = InMemoryEventBus()


def get_sync_redis_client() -> redis.Redis:
    """Returns a singleton synchronous Redis client."""
    global _redis_sync_client
    if _redis_sync_client is None:
        _redis_sync_client = redis.Redis.from_url(
            settings.effective_redis_url,
            socket_timeout=2.0,
            socket_connect_timeout=2.0,
            decode_responses=True,
        )
    return _redis_sync_client


def get_async_redis_client() -> aioredis.Redis:
    """Returns a singleton asynchronous Redis client."""
    global _redis_async_client
    if _redis_async_client is None:
        _redis_async_client = aioredis.from_url(
            settings.effective_redis_url,
            socket_timeout=2.5,
            socket_connect_timeout=2.5,
            decode_responses=True,
        )
    return _redis_async_client


def get_upstash_rest_client() -> Optional[Any]:
    """
    Returns an Upstash REST client if Upstash credentials are configured.
    Supports:
    1. Direct UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
    2. Parsed host + password from UPSTASH_REDIS_URL or REDIS_URL when pointing to Upstash
    """
    global _upstash_rest_client
    if _upstash_rest_client is not None:
        return _upstash_rest_client

    url = settings.UPSTASH_REDIS_REST_URL
    token = settings.UPSTASH_REDIS_REST_TOKEN

    if not url or not token:
        target_url = settings.UPSTASH_REDIS_URL or settings.REDIS_URL
        if target_url and "upstash.io" in target_url:
            try:
                parsed = urlparse(target_url)
                if parsed.hostname and parsed.password:
                    url = f"https://{parsed.hostname}"
                    token = parsed.password
            except Exception as e:
                logger.debug(f"[UPSTASH-REST] Could not derive REST credentials from URL: {e}")

    if url and token:
        try:
            from upstash_redis import Redis as UpstashRedis
            _upstash_rest_client = UpstashRedis(url=url, token=token)
            return _upstash_rest_client
        except Exception as e:
            logger.warning(f"[UPSTASH-REST] Failed to initialize Upstash REST client: {e}")

    return None


def is_redis_available() -> bool:
    """
    Quickly verifies whether Redis is online and responding.
    Caches the result for a few seconds to avoid latency spikes.
    """
    global _last_health_check_time, _cached_availability
    now = time.time()
    if now - _last_health_check_time < _HEALTH_CACHE_TTL:
        return _cached_availability

    try:
        client = get_sync_redis_client()
        pong = client.ping()
        _cached_availability = bool(pong)
        if _cached_availability:
            logger.debug("[REDIS] Ping successful")
    except Exception as e:
        logger.debug(f"[REDIS] Redis is offline or unreachable: {e}")
        _cached_availability = False

    _last_health_check_time = now
    return _cached_availability


def get_rq_queue(name: str = "default") -> Optional[Queue]:
    """
    Returns an RQ Queue instance connected to Redis, or None if Redis is offline.
    """
    if not is_redis_available():
        return None
    try:
        client = get_sync_redis_client()
        return Queue(name, connection=client)
    except Exception as e:
        logger.warning(f"[RQ] Failed to connect to RQ queue '{name}': {e}")
        return None


def publish_event(channel: str, event_type: str, data: dict[str, Any]) -> bool:
    """
    Publishes an event to both Redis Pub/Sub (if available) and the in-memory event bus.
    """
    payload = {
        "event": event_type,
        "data": data,
        "timestamp": time.time(),
    }

    # Always broadcast to in-memory bus for local subscribers
    in_memory_bus.publish(channel, payload)

    # Broadcast to Redis Pub/Sub if reachable
    if is_redis_available():
        try:
            client = get_sync_redis_client()
            client.publish(channel, json.dumps(payload))
            return True
        except Exception as e:
            logger.warning(f"[REDIS-PUBSUB] Failed to publish to channel '{channel}': {e}")
            return False
    return True


async def subscribe_event_stream(
    channel: str,
    timeout_seconds: int = 120,
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Asynchronous generator yielding event objects from Redis Pub/Sub,
    seamlessly falling back to the in-memory bus if Redis is unavailable.
    """
    if is_redis_available():
        try:
            client = get_async_redis_client()
            pubsub = client.pubsub()
            await pubsub.subscribe(channel)
            logger.info(f"[REDIS-PUBSUB] Subscribed to Redis channel '{channel}'")

            start_time = time.time()
            try:
                while time.time() - start_time < timeout_seconds:
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message.get("type") == "message":
                        raw_data = message.get("data")
                        if isinstance(raw_data, str):
                            yield json.loads(raw_data)
                    await asyncio.sleep(0.1)
            finally:
                await pubsub.unsubscribe(channel)
                if hasattr(pubsub, "aclose"):
                    await pubsub.aclose()
                else:
                    await pubsub.close()
            return
        except Exception as e:
            logger.warning(f"[REDIS-PUBSUB] Redis subscription failed ({e}), falling back to in-memory bus")

    # In-memory bus fallback
    queue = in_memory_bus.subscribe(channel)
    logger.info(f"[IN-MEMORY-BUS] Subscribed to in-memory channel '{channel}'")
    start_time = time.time()
    try:
        while time.time() - start_time < timeout_seconds:
            try:
                item = await asyncio.wait_for(queue.get(), timeout=1.0)
                yield item
            except asyncio.TimeoutError:
                continue
    finally:
        in_memory_bus.unsubscribe(channel, queue)
