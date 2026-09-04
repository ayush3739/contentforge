from typing import Optional
from pydantic import BaseModel, Field


class MetricItem(BaseModel):
    label: str = Field(description="Metric or KPI title, e.g. 'Systems Quarantined'")
    value: str = Field(description="Display value with units, e.g. '14 nodes' or '$2.5M' or '100%'")
    trend: Optional[str] = Field(default=None, description="Short context, e.g. 'Targeted Isolation' or 'Zero Leaks'")
    color: Optional[str] = Field(default="blue", description="Visual theme color: blue, emerald, purple, teal, amber, rose")
    percent: Optional[int] = Field(default=85, description="Percentage (0-100) for radial gauge progress rings")


class TimelineItem(BaseModel):
    time: str = Field(description="Timestamp or phase marker, e.g. '00:00 (T0)' or 'Phase 1'")
    event: str = Field(description="Title of the milestone or event")
    detail: Optional[str] = Field(default=None, description="Detailed explanation of what occurred")
    status: Optional[str] = Field(default="warning", description="Status level: critical, warning, or success")


class ComparisonBar(BaseModel):
    label: str = Field(description="Operational metric label, e.g. 'Database Cluster Isolation Integrity'")
    value: str = Field(description="Display value with units, e.g. '100% (14/14 nodes)'")
    percent: int = Field(description="Completion percentage (0-100) for horizontal bar width")
    color: Optional[str] = Field(default="blue", description="Bar color: blue, emerald, purple, teal, amber, rose")


class DataPoint(BaseModel):
    label: str = Field(..., description="The label or category for this data point")
    value: str = Field(..., description="The numerical or qualitative value")
    chart_type_recommendation: str = Field(default="metric", description="Recommended visualization type (e.g., metric, bar, pie, timeline)")


class InfographicSection(BaseModel):
    heading: str = Field(..., description="Section heading")
    content: str = Field(..., description="Brief contextual text for this section")
    evidence_refs: list[str] = Field(default_factory=list, description="List of chunk IDs or claim IDs supporting this section")


class InfographicSchema(BaseModel):
    artifact_type: str = Field(default="infographic", description="Always 'infographic'")
    title: str = Field(..., description="Main title of the infographic")
    subtitle: Optional[str] = Field(default=None, description="A brief subtitle explaining the core message")
    summary: Optional[str] = Field(default=None, description="Executive narrative overview for the infographic header")
    layout_type: str = Field(default="statistical", description="Recommended layout: timeline, comparison, statistical, or process")
    metrics: list[MetricItem] = Field(
        default_factory=list,
        description="3-4 key quantitative statistics with percentage values for visual progress rings"
    )
    timeline: list[TimelineItem] = Field(
        default_factory=list,
        description="Chronological milestones or process steps extracted from the document"
    )
    comparison_bars: list[ComparisonBar] = Field(
        default_factory=list,
        description="Horizontal comparative data bars highlighting operational metrics"
    )
    data_points: list[DataPoint] = Field(
        default_factory=list,
        description="General key statistics or data points"
    )
    sections: list[InfographicSection] = Field(
        default_factory=list,
        description="Textual sections providing context for the visuals"
    )
    evidence_refs: list[str] = Field(
        default_factory=list,
        description="Supporting chunk IDs or claim IDs"
    )

