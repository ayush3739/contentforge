"use client";

import { useSessionStore } from "@/store/useSessionStore";
import SourceViewer from "@/components/source/SourceViewer";
import CCOViewer from "@/components/cco/CCOViewer";
import EvidenceViewer from "@/components/evidence/EvidenceViewer";
import TransformationPlanner from "@/components/transform/TransformationPlanner";
import ArtifactViewer from "@/components/artifacts/ArtifactViewer";
import ProvenanceTimeline from "@/components/provenance/ProvenanceTimeline";
import StatusBadge from "@/components/sessions/StatusBadge";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Search,
  Sparkles,
  FileSpreadsheet,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SessionWorkspacePage({ params }: { params: { sessionId: string } }) {
  const { currentSession, activeTab, setActiveTab } = useSessionStore();

  const mockArtifact = {
    artifact_id: "ART-001",
    transformation_request_id: "TR-88412",
    cco_version_id: "CCO-v2-88412",
    type: "presentation",
    version: 1,
    status: "verified" as const,
    filename: "presentation_ART-001.pptx",
    download_url: "/api/v1/artifacts/ART-001/download",
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
      status: "PASSED" as const,
      grounding_score: 0.96,
      consistency_score: 0.98,
      unsupported_claim_count: 0,
      issues: [
        { claim: "14 production systems compromised", status: "supported" as const, evidence_ref: "chunk-001" },
        { claim: "Threat actor exploited CVE-2024-3094", status: "supported" as const, evidence_ref: "chunk-001" },
        { claim: "Estimated financial impact is $2.5M", status: "supported" as const, evidence_ref: "chunk-002" },
      ],
    },
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "source", label: "Source Document", icon: FileText },
    { key: "cco", label: "CCO View", icon: Layers, badge: "v2" },
    { key: "evidence", label: "Evidence Index", icon: Search },
    { key: "transform", label: "Transform", icon: Sparkles },
    { key: "artifacts", label: "Artifacts Workspace", icon: FileSpreadsheet },
    { key: "provenance", label: "Provenance Audit", icon: Lock },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Session Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border border-slate-800 bg-slate-900/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase">{currentSession?.id || params.sessionId}</span>
            <StatusBadge status={currentSession?.status || "active"} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">{currentSession?.name || "Ransomware Incident Response Workspace"}</h1>
          <p className="text-xs text-slate-400 mt-1">{currentSession?.description || "Multi-system payment processing breach assessment workspace"}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-400")} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-cyan-500/20 text-cyan-300 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Source Document</span>
              <h3 className="text-sm font-bold text-slate-100">Incident_Report.pdf</h3>
              <p className="text-xs text-emerald-400">Validated & Parsed</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs text-slate-400 font-medium">CCO Version</span>
              <h3 className="text-sm font-bold text-slate-100">CCO v2 (Active)</h3>
              <p className="text-xs text-cyan-400 font-mono">4 Claims • 3 Identifiers</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Artifact Status</span>
              <h3 className="text-sm font-bold text-slate-100">2 Outputs Generated</h3>
              <p className="text-xs text-purple-400 font-semibold">100% Grounding Score</p>
            </div>
          </div>
        )}

        {activeTab === "source" && <SourceViewer />}
        {activeTab === "cco" && <CCOViewer />}
        {activeTab === "evidence" && <EvidenceViewer />}
        {activeTab === "transform" && <TransformationPlanner />}
        {activeTab === "artifacts" && <ArtifactViewer artifact={mockArtifact} />}
        {activeTab === "provenance" && <ProvenanceTimeline />}
      </div>
    </div>
  );
}
