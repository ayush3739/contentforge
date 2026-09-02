"""
Redis-backed sliding-window rate limiter.

Owner: P5. See docs/RATE_LIMITING.md for defaults and the integration point.
P3 wires this into actual FastAPI middleware/dependencies once the app
factory exists — P5 does not own route registration.

Requires: redis-py (add to backend requirements — not vendored here).
"""
from __future__ import annotations

import os
import time
from dataclasses import dataclass

from infrastructure.security.events import SecurityEvent, SecurityEventType, record_event

DEFAULT_LIMITS: dict[str, tuple[int, int]] = {
    # route_group: (max_requests, window_seconds)
    "login": (int(os.environ.get("RATE_LIMIT_LOGIN_PER_5MIN", 5)), 300),
    "upload": (int(os.environ.get("RATE_LIMIT_UPLOAD_PER_5MIN", 20)), 300),
    "transformation": (int(os.environ.get("RATE_LIMIT_TRANSFORM_PER_5MIN", 10)), 300),
    "admin": (int(os.environ.get("RATE_LIMIT_ADMIN_PER_MIN", 60)), 60),
    "download": (int(os.environ.get("RATE_LIMIT_DOWNLOAD_PER_MIN", 60)), 60),
}


class RateLimitExceeded(Exception):
    def __init__(self, route_group: str, key: str):
        self.route_group = route_group
        self.key = key
        super().__init__(f"Rate limit exceeded for {route_group!r} (key={key!r})")


@dataclass
class RateLimiter:
    """
    Usage:
        limiter = RateLimiter(redis_client)
        limiter.check(user_id_or_ip, "login")
    """

    redis_client: object  # duck-typed redis.Redis, kept untyped to avoid a hard import at module load
    limits: dict[str, tuple[int, int]] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        if self.limits is None:
            self.limits = DEFAULT_LIMITS

    def check(self, key: str, route_group: str) -> None:
        if route_group not in self.limits:
            return  # unconfigured route groups are not rate-limited
        max_requests, window_seconds = self.limits[route_group]
        window_start = int(time.time()) // window_seconds
        redis_key = f"ratelimit:{route_group}:{key}:{window_start}"

        count = self.redis_client.incr(redis_key)
        if count == 1:
            self.redis_client.expire(redis_key, window_seconds)

        if count > max_requests:
            record_event(
                SecurityEvent(
                    event_type=SecurityEventType.RATE_LIMIT_EXCEEDED,
                    resource_type="route_group",
                    resource_id=route_group,
                    metadata={"key": key, "count": count, "max_requests": max_requests},
                )
            )
            raise RateLimitExceeded(route_group, key)
