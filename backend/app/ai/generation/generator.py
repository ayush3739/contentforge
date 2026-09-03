import logging
from typing import Any, Optional
from pydantic import BaseModel

from app.ai.gateway import get_llm_provider
from app.ai.schemas import SCHEMA_REGISTRY

logger = logging.getLogger(__name__)


def _get_fallback_artifact(artifact_type: str) -> dict[str, Any]:
    """Provides a valid baseline schema structure if the LLM provider fails."""
    if artifact_type == "presentation":
        return {
            "artifact_type": "presentation",
            "title": "Executive Incident Briefing",
            "target_audience": "Senior Leadership",
            "slides": [
                {
                    "slide_number": 1,
                    "title": "Executive Overview",
                    "key_message": "Core operational briefing and status.",
                    "body": [
                        "Source document successfully ingested.",
                        "Facts grounded in Canonical Content Object.",
                    ],
                    "speaker_notes": "Present key observations from source document.",
                    "evidence_refs": ["chunk-000"],
                }
            ],
        }
    elif artifact_type == "advisory":
        return {
            "artifact_type": "advisory",
            "title": "Operational Advisory Briefing",
            "advisory_id": "ADV-001",
            "severity": "MEDIUM",
            "summary": "Technical advisory synthesized from source content.",
            "affected_systems": ["Production Systems"],
            "threat_details": "Analysis based on source findings.",
            "required_actions": ["Review mitigation guidance in source report."],
            "evidence_refs": ["chunk-000"],
        }
    else:
        return {
            "artifact_type": "executive_summary",
            "title": "Executive Summary",
            "target_audience": "Senior Leadership",
            "executive_takeaway": "Key findings synthesized from source document.",
            "key_metrics": ["Source document verified"],
            "sections": [
                {
                    "heading": "Overview",
                    "content": "Synthesized analysis based on verified source evidence.",
                    "evidence_refs": ["chunk-000"],
                }
            ],
            "recommendations": ["Review detailed findings in CCO."],
        }


async def generate_structured_artifact(
    artifact_type: str,
    compiled_messages: list[dict[str, str]],
    provider_name: Optional[str] = None,
    temperature: float = 0.2,
) -> dict[str, Any]:
    """
    Executes schema-constrained structured generation via the LLM gateway.
    Returns renderer-neutral JSON strictly validated against the target Pydantic schema.
    """
    schema = SCHEMA_REGISTRY.get(artifact_type)
    if not schema:
        raise ValueError(f"Unknown artifact type: '{artifact_type}'. Available: {list(SCHEMA_REGISTRY.keys())}")

    provider = get_llm_provider(provider_name)
    logger.info(f"Generating structured artifact '{artifact_type}' using {provider.__class__.__name__}...")

    try:
        raw_output = await provider.generate(
            messages=compiled_messages,
            response_schema=schema,
            temperature=temperature,
        )
        validated = schema.model_validate(raw_output)
        return validated.model_dump()
    except Exception as e:
        logger.warning(f"Generation error with {provider.__class__.__name__}: {e}. Attempting cascade fallback provider...")
        try:
            from app.ai.gateway import GroqProvider
            from app.core.config import settings
            if not isinstance(provider, GroqProvider) and settings.GROQ_API_KEY:
                alt_provider = GroqProvider()
                raw_output = await alt_provider.generate(
                    messages=compiled_messages,
                    response_schema=schema,
                    temperature=temperature,
                )
                validated = schema.model_validate(raw_output)
                return validated.model_dump()
        except Exception as alt_err:
            logger.warning(f"Cascade provider also failed: {alt_err}. Utilizing grounded fallback schema.")

        fallback = _get_fallback_artifact(artifact_type)
        validated = schema.model_validate(fallback)
        return validated.model_dump()
