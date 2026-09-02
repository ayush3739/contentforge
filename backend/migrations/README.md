# Alembic Database Migrations

This folder contains Alembic database migration scripts for PostgreSQL + pgvector schema changes.

## Commands

```bash
# Initialize new migration
alembic revision --autogenerate -m "create core tables"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```
