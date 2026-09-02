# Environment Configuration

## Local development

1. `cp .env.example .env`
2. Fill in `LLM_API_KEY` with your own Gemini/OpenAI key (everything else already matches the working `docker compose` services and needs no change for local dev).
3. `docker compose up -d`

`.env.example` is organized into sections: APPLICATION, DATABASE, REDIS, OBJECT STORAGE, AUTH, AI/LLM, BLOCKCHAIN, LOGGING. The local values (`postgres:postgres`, `minioadmin:minioadmin`) are **development-only** — they match the containers in `docker-compose.yml` and are not secrets worth protecting in a local context, but must never be reused in production.

## Production configuration concept (not implemented yet)

For a real deployment (later phase, out of scope for this pass):

- Secrets (`JWT_SECRET`, `LLM_API_KEY`, DB/storage credentials) come from the platform's secret manager or CI/CD secret store — never from a committed file.
- `DEBUG=false`, `APP_ENV=production`.
- Database/Redis/object-storage endpoints point at managed or on-premise services, not `localhost`.
- On-premise deployment target: the architecture must not require sending source material to a public model provider (per `documents/05_P5_CLOUD_CYBER_BLOCKCHAIN.md` §10) — this shapes which `LLM_PROVIDER` is viable in that context, a decision for later.

## Rule

`.env` is listed in `.gitignore` and must **never** be committed. `.env.example` is committed and must **never** contain a real credential — only placeholders or safe local-dev-only defaults that match the docker-compose services.

Verified in this pass: no real API keys, passwords, or secrets are present in the repository. The uploaded `.env` matched `.env.example` exactly (dev-only placeholder values) and is correctly untracked by git.
