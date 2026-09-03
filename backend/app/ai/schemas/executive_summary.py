from typing import Optional
from pydantic import BaseModel, Field


class SummarySection(BaseModel):
    heading: str = Field(description="Section heading, e.g. 'Background', 'Incident Impact', 'Financial Exposure'")
    content: str = Field(description="Detailed narrative or structured paragraph")
    evidence_refs: list[str] = Field(
        default_factory=list,
        description="List of supporting evidence chunk or claim IDs"
    )


class FinancialExposure(BaseModel):
    category: str = Field(description="E.g., 'Lost Revenue', 'Remediation Cost', 'Compliance Fine'")
    estimated_cost: str = Field(description="Dollar amount or range")
    details: str = Field(description="Context for this exposure")

class ExecutiveSummarySchema(BaseModel):
    artifact_type: str = Field(default="executive_summary", description="Always 'executive_summary'")
    title: str = Field(description="Document title")
    target_audience: str = Field(description="Target executive audience")
    executive_takeaway: str = Field(description="Comprehensive multi-paragraph bottom-line briefing for leadership")
    key_metrics: list[str] = Field(default_factory=list, description="List of critical quantitative figures (e.g. '14 systems affected', '$2M cost')")
    financial_exposure: list[FinancialExposure] = Field(default_factory=list, description="Breakdown of potential or realized financial impacts")
    strategic_recommendations: list[str] = Field(default_factory=list, description="Actionable high-level strategic steps")
    sections: list[SummarySection] = Field(default_factory=list, description="Ordered sections of the executive summary")
    recommendations: list[str] = Field(default_factory=list, description="Actionable strategic recommendations")
