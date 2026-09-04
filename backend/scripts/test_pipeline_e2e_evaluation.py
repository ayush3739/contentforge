import asyncio
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.ai.pipeline import PipelineTransformRequest, run_transformation_pipeline

SAMPLE_DOC = """# Comprehensive Incident Report: Security Incident INC-2026-0814
Date: August 14, 2026
Author: CERT-In Operations & Enterprise Threat Response
Classification: TLP:AMBER

## Executive Overview
On August 14, 2026 at 00:00 UTC (T0), automated SIEM detection flagged abnormal outbound encrypted beaconing traffic originating from 14 payment gateway processing nodes. Forensic analysis confirmed active exploitation of CVE-2024-3094, an SSH upstream library backdoor attempt. 

## Timeline of Events
- 00:00 UTC (T0): Anomaly detected by SIEM outbound beaconing sensors. Alert severity: CRITICAL.
- 04:30 UTC (T+4h): Security Operations Center initiated targeted network isolation of the 14 compromised payment nodes.
- 12:00 UTC (T+12h): Root cause isolated to compromised supply-chain binary payload. Threat signature cataloged in CCO registry.
- 24:00 UTC (T+24h): Emergency kernel patch KB-9912 deployed across 100% of production clusters. Full system verification completed.

## Impact Analysis & Metrics
- Affected Nodes: 14 payment processing cluster nodes quarantined and restored.
- Customer PII Exposure: 0 unencrypted records leaked or exfiltrated (cryptographically confirmed via database hash checks).
- Financial Remediation Ceiling: Capped at $2.5M under corporate cyber risk underwriting.
- Business Continuity: Core payment transaction pipeline restored to 99.8% capacity within 24 hours.

## Key Actions Taken & Strategic Next Steps
1. Executed immediate network segmentation and ingress/egress firewall blackholing.
2. Verified zero customer data compromise with blockchain-anchored audit logging.
3. Rolled out continuous memory scanning and canary tokens across all secondary server farms.
4. Coordinated public vulnerability disclosures with regulatory compliance bodies.
"""

async def evaluate_outputs():
    print("=================================================================")
    print("STARTING END-TO-END AI PIPELINE EVALUATION & TESTING")
    print("=================================================================")

    output_types = [
        "social_post",
        "presentation",
        "infographic",
        "executive_summary",
        "advisory"
    ]

    req = PipelineTransformRequest(
        content=SAMPLE_DOC,
        filename="INC-2026-0814_Incident_Report.txt",
        output_types=output_types,
        audience="senior leadership & enterprise community",
        tone="professional and authoritative",
        language="en",
        detail_level="detailed",
        objective="decision briefing and transparent stakeholder communication",
        style="formal",
        custom_instructions="Focus heavily on the leadership actions taken, emphasize the zero PII leak metric, and produce realistic, production-grade communications ready for immediate publication.",
        social_config={
            "platform": "LinkedIn",
            "post_type": "Executive Communication",
            "tone": "Thought-Leadership / Incident Briefing",
            "length": "Medium",
            "hashtags": "#CyberSecurity #IncidentResponse #GovTech #Resilience"
        }
    )

    print(f"Executing pipeline with {len(output_types)} target formats...")
    response = await run_transformation_pipeline(req, db=None)

    print("\nTRANSFORMATION COMPLETED SUCCESSFULLY!")
    print(f"Session ID: {response.session_id}")
    print(f"Artifacts Generated: {len(response.artifacts)}")
    print(f"Cross Output Consistency Score: {response.cross_output_consistency.get('score')}")

    results_summary = {}

    for art in response.artifacts:
        print(f"\n-----------------------------------------------------------------")
        print(f"ARTIFACT TYPE: {art.artifact_type.upper()} (Status: {art.status})")
        print(f"Grounding Score: {art.verification.get('grounding_score', 'N/A')}")
        content = art.content
        results_summary[art.artifact_type] = content

        if art.artifact_type == "social_post":
            print(f"Platform: {content.get('platform')}")
            print(f"Hook: {content.get('hook')}")
            print(f"Body: {content.get('body')[:180]}...")
            print(f"Key Takeaways: {content.get('key_takeaways')}")
            print(f"CTA: {content.get('call_to_action')}")
            print(f"Hashtags: {content.get('hashtags')}")

        elif art.artifact_type == "presentation":
            print(f"Title: {content.get('title')}")
            slides = content.get("slides", [])
            print(f"Total Slides: {len(slides)}")
            for s in slides[:2]:
                print(f"  Slide {s.get('slide_number')}: {s.get('title')}")
                print(f"    Key Message: {s.get('key_message')}")
                print(f"    Bullets ({len(s.get('body', []))}): {s.get('body')[:2]}")
                print(f"    Speaker Notes: {s.get('speaker_notes')[:120]}...")

        elif art.artifact_type == "infographic":
            print(f"Title: {content.get('title')}")
            print(f"Metrics ({len(content.get('metrics', []))}):")
            for m in content.get("metrics", []):
                print(f"  * {m.get('label')}: {m.get('value')} ({m.get('percent')}%) [{m.get('trend')}]")
            print(f"Timeline Milestones ({len(content.get('timeline', []))}):")
            for t in content.get("timeline", [])[:3]:
                print(f"  * [{t.get('time')}] {t.get('event')} - Status: {t.get('status')}")
            print(f"Comparison Bars ({len(content.get('comparison_bars', []))}):")
            for b in content.get("comparison_bars", []):
                print(f"  * {b.get('label')}: {b.get('value')} ({b.get('percent')}%)")

        elif art.artifact_type == "executive_summary":
            print(f"Title: {content.get('title')}")
            print(f"Takeaway: {content.get('executive_takeaway')[:180]}...")
            print(f"Key Metrics: {content.get('key_metrics')}")

        elif art.artifact_type == "advisory":
            print(f"Title: {content.get('title')}")
            print(f"Severity: {content.get('severity')}")
            print(f"Affected Systems: {content.get('affected_systems')}")
            print(f"Actions: {content.get('required_actions')[:2]}")

    out_file = os.path.join(backend_dir, "scripts", "evaluation_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)
    print(f"\nDetailed evaluation results written to: {out_file}")

if __name__ == "__main__":
    asyncio.run(evaluate_outputs())
