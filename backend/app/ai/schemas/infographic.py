from pydantic import BaseModel, Field

class DataPoint(BaseModel):
    label: str = Field(..., description="The label or category for this data point")
    value: str = Field(..., description="The numerical or qualitative value")
    chart_type_recommendation: str = Field(..., description="Recommended visualization type (e.g., pie, bar, metric, timeline)")

class InfographicSection(BaseModel):
    heading: str = Field(..., description="Section heading")
    content: str = Field(..., description="Brief contextual text for this section")
    evidence_refs: list[str] = Field(default_factory=list, description="List of chunk IDs or claim IDs supporting this section")

class InfographicSchema(BaseModel):
    artifact_type: str = Field("infographic", description="Type of artifact")
    title: str = Field(..., description="Main title of the infographic")
    subtitle: str = Field(..., description="A brief subtitle explaining the core message")
    layout_type: str = Field(..., description="Recommended layout style, e.g., timeline, comparison, statistical, process")
    data_points: list[DataPoint] = Field(..., description="Key statistics or data points extracted from the document")
    sections: list[InfographicSection] = Field(..., description="Textual sections providing context for the visuals")
