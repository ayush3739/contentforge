"""
Jobs & Async Queue Package — Jointly owned by P3 & P1

Handles asynchronous background task orchestration via Redis:
- workers.py: Redis queue runner / task consumers
- tasks.py: Asynchronous job definitions (ingestion, AI generation, rendering)
- state.py: Job status tracking (QUEUED -> PROCESSING -> GENERATING -> VERIFYING -> COMPLETED)
"""
