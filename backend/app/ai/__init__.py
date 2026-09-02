"""
AI Pipeline Package — Owned by P1 (AI Engineer)

This package contains the intelligence layer of ContentForge AI:
- ingestion/: Document parsing (PDF, DOCX, TXT) into layout blocks
- extraction/: Deterministic extractor (dates, numbers) + LLM semantic extraction
- cco/: Canonical Content Object builder and version manager
- chunking/: Semantic text chunking with page and section metadata
- retrieval/: pgvector RAG interface for top-k evidence retrieval
- planner/: Transformation planner mapping operator intent to recipes
- prompts/: Prompt compiler enforcing strict prompt-injection boundaries
- gateway/: Model-agnostic LLM provider interface (Gemini, OpenAI, Anthropic, Ollama)
- generation/: Schema-constrained JSON generator
- verification/: Grounding verifier, factual consistency, and cross-output consistency
- revision/: Automated revision loop applying verification feedback
"""
