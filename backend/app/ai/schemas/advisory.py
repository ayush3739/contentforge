from typing import Optional
from pydantic import BaseModel, Field


class IoC(BaseModel):
    indicator_type: str = Field(description="e.g. 'IP Address', 'Domain', 'SHA256', 'CVE'")
    value: str = Field(description="The actual indicator value")
    context: str = Field(description="Brief explanation of why this IoC is relevant")

class TimelineEvent(BaseModel):
    timestamp: str = Field(description="Date or time of the event")
    description: str = Field(description="What occurred at this time")

class AdvisorySchema(BaseModel):
    artifact_type: str = Field(default="advisory", description="Always 'advisory'")
    title: str = Field(description="Advisory title, e.g. 'URGENT: Active Exploitation of CVE-2024-XXXX'")
    advisory_id: str = Field(description="Identifier like 'ADV-2026-001'")
    severity: str = Field(description="Severity: CRITICAL, HIGH, MEDIUM, LOW")
    summary: str = Field(description="Concise description of the advisory threat or situation")
    affected_systems: list[str] = Field(default_factory=list, description="List of impacted operating systems, platforms, or services")
    incident_timeline: list[TimelineEvent] = Field(default_factory=list, description="Chronological sequence of relevant events")
    threat_details: str = Field(default="", description="Deep technical mechanism, attack vector, or root cause")
    ioc_table: list[IoC] = Field(default_factory=list, description="List of Indicators of Compromise")
    containment_steps: list[str] = Field(default_factory=list, description="Immediate steps to stop the threat")
    required_actions: list[str] = Field(default_factory=list, description="Long-term prioritized remediation steps and mitigation guidance")
    evidence_refs: list[str] = Field(default_factory=list, description="Supporting evidence references")
