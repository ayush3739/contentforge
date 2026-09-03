import logging
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.ai.gateway import get_llm_provider
from app.core.config import settings

logger = logging.getLogger(__name__)


class TransformationPlan(BaseModel):
    artifact_type: str = Field(description="Target output type: presentation, executive_summary, advisory")
    audience: str = Field(description="Target audience")
    tone: str = Field(description="Selected tone")
    detail_level: str = Field(description="concise, balanced, or detailed")
    retrieval_queries: list[str] = Field(
        default_factory=list,
        description="List of 3-5 distinct, highly targeted RAG search queries for evidence retrieval"
    )
    planned_sections: list[str] = Field(description="List of structured sections planned for generation")
    constraints: list[str] = Field(default_factory=list, description="Strict boundaries for generation")


PLANNER_SYSTEM_PROMPT = """
You are the Agentic Transformation Planner for ContentForge AI.
Your task is to analyze the source Canonical Content Object (CCO) metadata and formulate a strict TransformationPlan.
Based on the objective and artifact_type, output:
1. `planned_sections`: An ordered list of structured sections that should be generated. Make it comprehensive.
2. `retrieval_queries`: A list of 3-5 highly distinct, specific search queries to retrieve evidence from the vector database. Each query must target a different facet (e.g., "CVE impact", "financial exposure metrics", "remediation timeline").
3. `constraints`: Any specific constraints the generation model must follow.
"""

async def plan_transformation_async(
    artifact_type: str,
    audience: str = "senior leadership",
    tone: str = "professional",
    language: str = "en",
    detail_level: str = "balanced",
    objective: str = "inform",
    style: str = "standard",
    cco: Optional[dict[str, Any]] = None,
    provider_name: Optional[str] = None,
) -> TransformationPlan:
    """
    Agentic planner that queries the LLM to generate targeted RAG queries and a section outline.
    """
    provider = get_llm_provider(provider_name)
    cco = cco or {}
    
    # Core fallback constraints
    base_constraints = []
    if detail_level == "concise":
        base_constraints.append("Keep explanations terse and high-level; prioritize brevity.")
    elif detail_level == "detailed":
        base_constraints.append("Provide comprehensive context, technical nuances, and multi-paragraph supporting arguments.")
    
    if artifact_type == "presentation":
        base_constraints.extend([
            "Every slide must cite at least one evidence_ref (chunk ID or claim ID).",
            "Keep slide bullet points punchy and scannable.",
            "Include actionable speaker notes for every slide."
        ])
    
    cco_summary = {
        "title": cco.get("metadata", {}).get("title", "Document"),
        "overview": cco.get("metadata", {}).get("overview", ""),
        "claims_count": len(cco.get("claims", [])),
    }

    messages = [
        {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
        {"role": "user", "content": f"Generate TransformationPlan.\nTarget: {artifact_type}\nAudience: {audience}\nDetail: {detail_level}\nCCO: {cco_summary}"}
    ]

    try:
        router_model = getattr(settings, "GROQ_ROUTER_MODEL", "openai/gpt-oss-20b")
        model = router_model if provider_name == "groq" or settings.LLM_PROVIDER.lower() == "groq" else None
        
        data = await provider.generate(
            messages=messages,
            response_schema=TransformationPlan,
            temperature=0.2,
            model=model
        )
        plan = TransformationPlan.model_validate(data)
        
        # Ensure our base constraints are preserved
        for bc in base_constraints:
            if bc not in plan.constraints:
                plan.constraints.append(bc)
        
        # Ensure we have fallback queries if model generated none
        if not plan.retrieval_queries:
            plan.retrieval_queries = [f"{cco_summary['title']} {artifact_type} summary"]
            
        return plan
    except Exception as e:
        logger.warning(f"Agentic Planner failed: {e}. Falling back to deterministic plan.")
        return _fallback_plan(artifact_type, audience, tone, detail_level, cco_summary, base_constraints)


def _fallback_plan(artifact_type, audience, tone, detail_level, cco_summary, constraints) -> TransformationPlan:
    title = cco_summary.get("title", "Document")
    if artifact_type == "presentation":
        sections = ["Executive Overview", "Core Problem & Background", "Key Impact", "Strategic Implications", "Next Steps"]
        queries = [f"{title} findings impact statistics", f"{title} recommendations"]
    elif artifact_type == "advisory":
        sections = ["Executive Summary", "Affected Systems", "Threat Details", "Required Actions"]
        queries = [f"{title} vulnerability CVE affected systems", f"{title} remediation mitigation"]
    else:
        artifact_type = "executive_summary"
        sections = ["Executive Takeaway", "Context", "Critical Metrics", "Strategic Recommendations"]
        queries = [f"{title} executive summary background", f"{title} metrics findings conclusions"]
        
    return TransformationPlan(
        artifact_type=artifact_type,
        audience=audience,
        tone=tone,
        detail_level=detail_level,
        retrieval_queries=queries,
        planned_sections=sections,
        constraints=constraints
    )
