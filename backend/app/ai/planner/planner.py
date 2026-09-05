import logging
from typing import Any, Optional
from pydantic import BaseModel, Field

from app.ai.gateway import get_llm_provider
from app.core.config import settings

logger = logging.getLogger(__name__)


class TransformationPlan(BaseModel):
    artifact_type: str = Field(description="Target output type: presentation, executive_summary, advisory, social_post, infographic, video_package")
    audience: str = Field(description="Target audience")
    tone: str = Field(description="Selected tone")
    detail_level: str = Field(description="concise, balanced, or detailed")
    custom_instructions: Optional[str] = Field(default=None, description="User's custom emphasis instructions")
    social_config: Optional[dict[str, Any]] = Field(default=None, description="Social post configuration options")
    retrieval_queries: list[str] = Field(
        default_factory=list,
        description="List of 3-5 distinct, highly targeted RAG search queries for evidence retrieval"
    )
    planned_sections: list[str] = Field(description="List of structured sections planned for generation")
    constraints: list[str] = Field(default_factory=list, description="Strict boundaries for generation")


PLANNER_SYSTEM_PROMPT = """
You are the Agentic Transformation Planner for ContentForge AI.
Your task is to analyze the source Canonical Content Object (CCO) metadata and formulate a strict TransformationPlan.
Based on the objective, artifact_type, and especially any custom_instructions provided by the user, output:
1. `planned_sections`: An ordered list of structured sections that should be generated. Make it comprehensive.
2. `retrieval_queries`: A list of 3-5 highly distinct, specific search queries to retrieve evidence from the vector database. Each query must target a different facet (e.g., "CVE impact", "financial exposure metrics", "remediation timeline"). If the user provided custom_instructions, prioritize queries that retrieve evidence directly matching the user's specific request or focus areas.
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
    custom_instructions: Optional[str] = None,
    social_config: Optional[dict[str, Any]] = None,
    cco: Optional[dict[str, Any]] = None,
    provider_name: Optional[str] = None,
) -> TransformationPlan:
    """
    Agentic planner that queries the LLM to generate targeted RAG queries and a section outline.
    """
    provider = get_llm_provider(provider_name)
    cco = cco or {}
    
    # Core fallback constraints
    base_constraints = [
        "Synthesize comprehensive, publication-grade professional intelligence with concrete factual details.",
        "Ensure every major claim, timeline milestone, and technical finding from the CCO is thoroughly articulated.",
        "Avoid superficial or robotic one-liners; deliver substantive executive narratives with actionable depth.",
    ]
    if detail_level == "concise":
        base_constraints.append("Structure for executive readability with clear hierarchy, high signal-to-noise ratio, and impactful substance.")
    elif detail_level == "detailed":
        base_constraints.append("Provide comprehensive context, technical nuances, and multi-paragraph supporting arguments.")
    
    if custom_instructions:
        base_constraints.append(f"MANDATORY OPERATOR INSTRUCTION: Prioritize this specific focus: '{custom_instructions}'")
    
    if artifact_type == "presentation":
        base_constraints.extend([
            "Every slide must cite at least one evidence_ref (chunk ID or claim ID).",
            "Keep slide bullet points substantive, impactful, and scannable with active, insightful titles.",
            "Include actionable, detailed conversational speaker notes for every slide."
        ])
    elif artifact_type == "social_post":
        base_constraints.extend([
            "Craft an authentic, high-impact post that looks like genuine corporate communications published by top organizations.",
            "Integrate takeaways cleanly into the post narrative using bullet points (e.g. 🔹 or •) without meta-commentary.",
            "Include an attention-grabbing hook, concrete metrics, clear call to action, and 3-5 platform-optimized hashtags."
        ])
    elif artifact_type == "infographic":
        base_constraints.extend([
            "Extract 3-4 quantitative metrics with percentages (0-100) to feed visual radial progress rings.",
            "Construct chronological milestone timeline items with status indicators (critical, warning, success).",
            "Generate horizontal comparative data bars with percentage completions."
        ])
    
    cco_summary = {
        "title": cco.get("metadata", {}).get("title", "Document"),
        "overview": cco.get("metadata", {}).get("overview", ""),
        "claims_count": len(cco.get("claims", [])),
    }

    user_prompt_parts = [
        "Generate TransformationPlan.",
        f"Target: {artifact_type}",
        f"Audience: {audience}",
        f"Tone: {tone}",
        f"Detail: {detail_level}",
        f"Objective: {objective}",
        f"Style: {style}",
    ]
    if custom_instructions:
        user_prompt_parts.append(f"Custom Instructions: {custom_instructions}")
    if social_config:
        user_prompt_parts.append(f"Social Config: {social_config}")
    user_prompt_parts.append(f"CCO: {cco_summary}")

    messages = [
        {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
        {"role": "user", "content": "\n".join(user_prompt_parts)}
    ]

    try:
        router_model = getattr(settings, "GROQ_ROUTER_MODEL", "openai/gpt-oss-20b")
        model = router_model if provider_name == "groq" or settings.LLM_PROVIDER.lower() == "groq" else None
        
        data = await provider.generate(
            messages=messages,
            response_schema=TransformationPlan,
            temperature=0.2,
            max_tokens=4096,
            model=model
        )
        plan = TransformationPlan.model_validate(data)
        plan.custom_instructions = custom_instructions
        plan.social_config = social_config
        
        # Ensure our base constraints are preserved
        for bc in base_constraints:
            if bc not in plan.constraints:
                plan.constraints.append(bc)
        
        # Ensure we have fallback queries if model generated none
        if not plan.retrieval_queries:
            plan.retrieval_queries = [f"{cco_summary['title']} {artifact_type} summary"]
        
        # If user gave custom instructions, ensure a dedicated retrieval query exists for them
        if custom_instructions:
            plan.retrieval_queries.insert(0, f"{cco_summary['title']} {custom_instructions}")
            
        return plan
    except Exception as e:
        logger.warning(f"Agentic Planner failed: {e}. Falling back to deterministic plan.")
        return _fallback_plan(
            artifact_type=artifact_type,
            audience=audience,
            tone=tone,
            detail_level=detail_level,
            cco_summary=cco_summary,
            constraints=base_constraints,
            custom_instructions=custom_instructions,
            social_config=social_config,
        )


def _fallback_plan(
    artifact_type: str,
    audience: str,
    tone: str,
    detail_level: str,
    cco_summary: dict,
    constraints: list[str],
    custom_instructions: Optional[str] = None,
    social_config: Optional[dict[str, Any]] = None,
) -> TransformationPlan:
    title = cco_summary.get("title", "Document")
    if artifact_type == "presentation":
        sections = ["Executive Overview", "Core Problem & Findings", "Key Operational Impact", "Strategic Implications", "Action Plan & Next Steps"]
        queries = [f"{title} findings impact statistics", f"{title} recommendations next steps"]
    elif artifact_type == "advisory":
        sections = ["Executive Summary", "Affected Systems", "Threat Details & Analysis", "Indicators of Compromise", "Required Actions"]
        queries = [f"{title} vulnerability affected systems", f"{title} indicators of compromise", f"{title} remediation mitigation"]
    elif artifact_type == "social_post":
        sections = ["Hook", "Core Narrative & Context", "Key Takeaways", "Call to Action", "Hashtags"]
        queries = [f"{title} key findings", f"{title} impact takeaway", f"{title} recommendations"]
    elif artifact_type == "infographic":
        sections = ["Executive Metric Cards", "Process Timeline", "Comparative Impact Bars", "Key Takeaways"]
        queries = [f"{title} key statistics metrics", f"{title} chronology timeline", f"{title} comparison data"]
    elif artifact_type == "video_package":
        sections = ["Title Card", "Opening Scene: Hook", "Scene 2: Problem & Findings", "Scene 3: Operational Impact", "Scene 4: Next Steps"]
        queries = [f"{title} overview", f"{title} key takeaways"]
    else:
        sections = ["Executive Takeaway", "Context", "Critical Metrics", "Strategic Recommendations"]
        queries = [f"{title} executive summary background", f"{title} metrics findings conclusions"]

    if custom_instructions:
        queries.insert(0, f"{title} {custom_instructions}")
        
    return TransformationPlan(
        artifact_type=artifact_type,
        audience=audience,
        tone=tone,
        detail_level=detail_level,
        custom_instructions=custom_instructions,
        social_config=social_config,
        retrieval_queries=queries,
        planned_sections=sections,
        constraints=constraints,
    )
