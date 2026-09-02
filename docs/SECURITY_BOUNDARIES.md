# Security Boundaries — Prompt Injection

## The four trust tiers (Doc 00 §15 / Doc 05 §9)

```
SYSTEM INSTRUCTIONS      — highest trust, set by P1's pipeline code
OPERATOR PARAMETERS      — set by an authenticated analyst/reviewer via the UI
TRUSTED CCO / EVIDENCE   — derived data, already passed through P1's extraction
UNTRUSTED SOURCE CONTENT — raw uploaded document text
```

**Rule:** source content must never be able to override system or operator instructions, even if it contains text like *"ignore previous instructions"*. It is content to be summarized/analyzed, never a command.

## Ownership

- **P1** owns the actual defense: how the prompt is assembled so untrusted text can't escape its role (e.g. delimiting/escaping source text, structured-output constraints, instruction-hierarchy prompting). This is AI-pipeline logic — P5 does not write prompts.
- **P5** provides the surrounding infrastructure that limits blast radius if a defense is bypassed:
  - **Request tracing** — every request gets an `X-Request-ID` (see `infrastructure/logging/`), so an incident can be traced end-to-end.
  - **Event recording** — `infrastructure/security/events.py` gives P1 a one-line call (`record_event(SecurityEvent(event_type=PROMPT_INJECTION_DETECTED, ...))`) to log a detected attempt once P1's own detector fires.
  - **Network isolation** — Docker network `contentforge-network` keeps DB/Redis/MinIO off the public network (see `docs/HEALTHCHECKS.md` / compose file); the AI service should not have arbitrary outbound network access beyond its configured LLM provider.
  - **Rate limiting** — see `docs/RATE_LIMITING.md`, so a prompt-injection probing loop can't hammer the endpoint indefinitely.
  - **Least privilege** — the AI pipeline's storage/DB credentials should only reach the resources it needs (documents/CCO/artifacts), not admin tables.

## What P5 explicitly does not do

Does not parse, filter, or rewrite prompt content. Does not implement an injection classifier. That is P1's AI-level responsibility per Doc 00/05.
