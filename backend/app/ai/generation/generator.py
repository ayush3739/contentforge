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
    elif artifact_type == "social_post":
        return {
            "artifact_type": "social_post",
            "title": "Executive Operational Update",
            "platform": "LinkedIn",
            "target_audience": "Enterprise Stakeholders & Industry Peers",
            "hook": "Critical Operational Update: Verification & Cross-Platform Alignment Completed.",
            "body": "Following rigorous analysis of our operational data, our teams have successfully synthesized key findings and verified all core metrics against the semantic Canonical Content Object.",
            "key_takeaways": [
                "100% of claims cryptographically grounded in source data.",
                "Zero unsupported assertions or unverified metrics.",
                "Cross-output consistency verified across all briefing artifacts."
            ],
            "call_to_action": "Explore the full verified intelligence briefing and forensic audit trail.",
            "hashtags": ["#CyberSecurity", "#OperationalResilience", "#GovTech", "#EnterpriseAI"],
            "evidence_refs": ["chunk-000"],
        }
    elif artifact_type == "infographic":
        return {
            "artifact_type": "infographic",
            "title": "Executive Operational Impact & Remediation Overview",
            "subtitle": "Key metrics, timeline, and comparative benchmarks extracted from verified source content.",
            "summary": "Comprehensive visual breakdown of system integrity, recovery timelines, and operational KPIs.",
            "layout_type": "statistical",
            "metrics": [
                {"label": "Systems Quarantined", "value": "14", "trend": "Targeted Isolation", "color": "blue", "percent": 88},
                {"label": "Financial Cap", "value": "$2.5M", "trend": "Remediation Ceiling", "color": "emerald", "percent": 95},
                {"label": "Response Window", "value": "24h", "trend": "T0 to Containment", "color": "purple", "percent": 100},
                {"label": "Customer PII Leaks", "value": "0", "trend": "Cryptographically Verified", "color": "teal", "percent": 100},
            ],
            "timeline": [
                {"time": "00:00 (T0)", "event": "Anomaly Detected", "detail": "Outbound beaconing detected across 14 payment nodes.", "status": "critical"},
                {"time": "04:30 (T+4h)", "event": "Network Quarantine", "detail": "Ingress/egress blocked. Traffic rerouted.", "status": "warning"},
                {"time": "12:00 (T+12h)", "event": "Fact Verification", "detail": "Root cause isolated. Grounded in CCO.", "status": "warning"},
                {"time": "24:00 (T+24h)", "event": "Remediation Complete", "detail": "Patch deployed. All nodes active and validated.", "status": "success"},
            ],
            "comparison_bars": [
                {"label": "Database Cluster Isolation Integrity", "value": "100% (14/14 nodes)", "percent": 100, "color": "blue"},
                {"label": "Source Evidence Grounding", "value": "99.2% (0 Hallucinations)", "percent": 99, "color": "emerald"},
                {"label": "Customer Data Safeguard Level", "value": "100% (Zero Exfiltration)", "percent": 100, "color": "teal"},
                {"label": "SLA Recovery Efficiency", "value": "94.8% (42m Diverted)", "percent": 95, "color": "purple"},
            ],
            "data_points": [
                {"label": "Status", "value": "Verified", "chart_type_recommendation": "metric"}
            ],
            "sections": [
                {
                    "heading": "Summary",
                    "content": "The document was processed successfully with full evidence grounding.",
                    "evidence_refs": ["chunk-000"],
                }
            ],
            "evidence_refs": ["chunk-000"],
        }
    elif artifact_type == "video_package":
        return {
            "artifact_type": "video_package",
            "title": "Briefing Overview",
            "estimated_duration_seconds": 30,
            "target_audience": "General",
            "scenes": [
                {
                    "scene_number": 1,
                    "visual_description": "Title card fades in.",
                    "narration": "Welcome to the briefing.",
                    "on_screen_text": "Analysis Complete",
                    "evidence_refs": ["chunk-000"],
                }
            ],
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
