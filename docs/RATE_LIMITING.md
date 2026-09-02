# Rate Limiting Support

## Scope

```
/auth/login
/sessions/{id}/documents   (upload)
/transformations           (generate)
/admin/*
/artifacts/{id}/download
```

## Suggested defaults (configurable, not hard-coded production limits)

| Route group | Limit | Window | Key |
|---|---|---|---|
| `/auth/login` | 5 attempts | 5 min | per IP |
| upload | 20 requests | 5 min | per user |
| transformation generate | 10 requests | 5 min | per user |
| `/admin/*` | 60 requests | 1 min | per user |
| download | 60 requests | 1 min | per user |

These are hackathon-reasonable starting points via env vars (`RATE_LIMIT_LOGIN_PER_5MIN`, etc. — see `infrastructure/security/rate_limit.py`), not production SLAs. Tune after real usage data.

## Backing store

**Redis**, per Doc 05 §5 and top-level instructions ("prefer Redis for distributed rate-limit state... do not use Redis as permanent application storage"). A sliding-window counter using `INCR` + `EXPIRE` on a key like `ratelimit:{route}:{key}:{window_start}` is sufficient for hackathon scale.

## Integration

P5 cannot implement real middleware without P3's FastAPI app structure (routing, dependency injection setup) already existing. Instead, `infrastructure/security/rate_limit.py` provides:

- `RateLimiter.check(key: str, route_group: str) -> None` — raises `RateLimitExceeded` if over budget, using Redis.
- A `record_event(SecurityEventType.RATE_LIMIT_EXCEEDED, ...)` call already wired in on rejection.

**P3 integration point:** wrap this in a FastAPI middleware or per-route `Depends()` that calls `RateLimiter.check(user_id_or_ip, route_group)` before the handler body runs. Exact wiring is P3's call once the app factory exists.
