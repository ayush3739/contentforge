import json
import logging
from typing import Any, Optional

from app.ai.gateway import get_llm_provider
from app.ai.planner.planner import TransformationPlan
from app.ai.prompts.compiler import compile_transformation_prompt
from app.ai.schemas import SCHEMA_REGISTRY
from app.ai.verification.verifier import VerificationReport, verify_artifact

logger = logging.getLogger(__name__)

MAX_REVISIONS = 2


async def revise_artifact(
    artifact: dict[str, Any],
    report: VerificationReport,
    plan: TransformationPlan,
    cco: dict[str, Any],
    evidence: list[dict[str, Any]],
    provider_name: Optional[str] = None,
) -> tuple[dict[str, Any], VerificationReport]:
    """
    Executes an automated, bounded revision loop (up to MAX_REVISIONS = 2).
    Feeds specific verification failure issues back to the LLM to correct
    hallucinations or missing citations without manual intervention.
    """
    current_artifact = artifact
    current_report = report
    revision_count = 0

    schema = SCHEMA_REGISTRY.get(plan.artifact_type)
    provider = get_llm_provider(provider_name)

    while current_report.status != "PASSED" and revision_count < MAX_REVISIONS:
        revision_count += 1
        logger.info(f"Triggering automated revision attempt {revision_count}/{MAX_REVISIONS} for {plan.artifact_type}...")

        # Formulate targeted revision feedback
        issues_summary = "\n".join(
            f"- [{iss.severity}] {iss.category}: {iss.description} (Location: {iss.location or 'General'})"
            for iss in current_report.issues
        )

        revision_prompt = [
            {
                "role": "system",
                "content": (
                    "You are ContentForge AI's Quality & Grounding Corrector. "
                    "Your previous generation contained verification issues. "
                    "You must revise the artifact to completely fix all identified issues while preserving accurate facts."
                )
            },
            {
                "role": "user",
                "content": (
                    f"PREVIOUS DRAFT:\n```json\n{json.dumps(current_artifact, indent=2)}\n```\n\n"
                    f"VERIFICATION ISSUES DETECTED:\n{issues_summary}\n\n"
                    f"CCO SOURCE FACTS TO RESPECT:\n{json.dumps(cco.get('numbers', []), indent=2)}\n\n"
                    "INSTRUCTION: Return a revised, fully compliant, schema-validated JSON with all issues resolved."
                )
            }
        ]

        try:
            revised_data = await provider.generate(
                messages=revision_prompt,
                response_schema=schema,
                temperature=0.1,
            )
            validated = schema.model_validate(revised_data)
            current_artifact = validated.model_dump()
            # Re-verify
            current_report = verify_artifact(current_artifact, cco, evidence)
            logger.info(f"Post-revision {revision_count} verification status: {current_report.status} (grounding: {current_report.grounding_score})")
        except Exception as e:
            logger.error(f"Revision {revision_count} failed with error: {e}. Keeping prior draft.")
            break

    return current_artifact, current_report
