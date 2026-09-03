"use client";

import ArtifactViewer from "@/components/artifacts/ArtifactViewer";
import VerificationPanel from "@/components/verification/VerificationPanel";
import { ArtifactItem } from "@/types/artifact";

export default function ArtifactWorkspacePage({ params }: { params: { artifactId: string } }) {
  const artifact: ArtifactItem = {
    artifact_id: params.artifactId,
    transformation_request_id: "TR-88412",
    cco_version_id: "CCO-v2-88412",
    type: "presentation",
    version: 1,
    status: "verified",
    filename: `presentation_${params.artifactId}.pptx`,
    download_url: `/api/v1/artifacts/${params.artifactId}/download`,
    checksum: "sha256:8a91f42e391b002c91847120a11c8d",
    content_json: {
      title: "Executive Incident Briefing: Ransomware Attack",
      slides: [
        {
          slide_number: 1,
          title: "Incident Overview & Quarantine Impact",
          key_message: "14 payment gateway systems quarantined within 24 hours.",
          body: [
            "Breach detected on August 14, 2026 across core payment processing nodes.",
            "Threat actor exploited CVE-2024-3094 vulnerability.",
            "450 GB of encrypted logs exfiltrated before node isolation.",
          ],
          speaker_notes: "Walk executive leaders through initial response timeline.",
          evidence_refs: ["chunk-001"],
        },
        {
          slide_number: 2,
          title: "Financial & Operational Risk Assessment",
          key_message: "Financial impact capped at $2.5M; remediation underway.",
          body: [
            "Estimated financial impact totals $2.5 million.",
            "All compromised credentials revoked and patch KB-9912 deployed.",
            "No unencrypted PII data compromised.",
          ],
          speaker_notes: "Emphasize operational risk is contained.",
          evidence_refs: ["chunk-002"],
        },
      ],
    },
    verification: {
      status: "PASSED",
      grounding_score: 0.96,
      consistency_score: 0.98,
      unsupported_claim_count: 0,
      issues: [
        { claim: "14 production systems compromised", status: "supported", evidence_ref: "chunk-001" },
        { claim: "Threat actor exploited CVE-2024-3094", status: "supported", evidence_ref: "chunk-001" },
        { claim: "Estimated financial impact is $2.5M", status: "supported", evidence_ref: "chunk-002" },
      ],
    },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="font-mono text-xs text-cyan-400 font-bold uppercase">{params.artifactId}</span>
        <h1 className="text-xl font-bold text-slate-100 mt-0.5">Artifact Workspace & Grounding Verification</h1>
      </div>

      <ArtifactViewer artifact={artifact} />
      <VerificationPanel report={artifact.verification} />
    </div>
  );
}
