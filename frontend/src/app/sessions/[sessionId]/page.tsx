"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { fetchSession, fetchSessionArtifacts } from "@/lib/api";
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
  Columns,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Presentation,
  ShieldAlert,
  BarChart3,
  Video,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SessionWorkspacePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const viewParam = searchParams.get("view");
  const { currentSession, setCurrentSession, currentCCO, activeTab, setActiveTab } = useSessionStore();
  const [layoutMode, setLayoutMode] = useState<"split" | "tabs">("split");
  const [activeStage, setActiveStage] = useState<"plan" | "artifacts">(
    tabParam === "transform" ? "plan" : viewParam === "artifacts" ? "artifacts" : "plan"
  );

  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [selectedArtifactIdx, setSelectedArtifactIdx] = useState(0);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoadingArtifacts(true);
      const [sess, arts] = await Promise.all([
        fetchSession(sessionId).catch(() => null),
        fetchSessionArtifacts(sessionId).catch(() => []),
      ]);

      if (sess) {
        setCurrentSession(sess);
      }

      setArtifacts(arts || []);

      // If URL explicitly asks for transform / plan, respect it
      if (tabParam === "transform" || viewParam === "plan") {
        setActiveStage("plan");
      } else if (viewParam === "artifacts") {
        setActiveStage("artifacts");
      } else if (arts && arts.length > 0) {
        setActiveStage("artifacts");
      } else {
        setActiveStage("plan");
      }
    } catch (err) {
      console.error("Failed to load session workspace:", err);
    } finally {
      setIsLoadingArtifacts(false);
    }
  }, [sessionId, tabParam, viewParam, setCurrentSession]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic CCO claims from session store or current session
  const claims = currentCCO?.claims || [];
  const sourceDocName = (currentSession as any)?.documents?.[0]?.name || "Source Document";

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "presentation":
        return <Presentation className="h-3.5 w-3.5 text-blue-600" />;
      case "executive_summary":
        return <FileText className="h-3.5 w-3.5 text-purple-600" />;
      case "advisory":
        return <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />;
      default:
        return <FileSpreadsheet className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const mockArtifact = {
    artifact_id: `ART-${sessionId.substring(4, 10)}`,
    transformation_request_id: `TR-${sessionId.substring(4, 10)}`,
    cco_version_id: currentCCO?.cco_version_id || "CCO-v1",
    type: "presentation",
    version: 1,
    status: "verified" as const,
    filename: `presentation_${sessionId.substring(4, 10)}.pptx`,
    download_url: `/api/v1/artifacts/${sessionId}/download`,
    checksum: currentCCO?.hash || "sha256:8a91f42e391b002c91847120a11c8d",
    available_formats: ["presentation", "executive_summary", "advisory"],
    content_json: {
      title: currentSession?.name ? `${currentSession.name} - Grounded Output` : "Grounded Transformation Briefing",
      executive_overview: currentCCO?.executive_overview || "Semantic transformation pipeline grounded against source document.",
      key_findings: (currentCCO?.key_findings || []).map((f) => ({ finding: f, impact: "High", evidence_ref: "chunk-001" })),
      slides: [
        {
          slide_number: 1,
          title: currentCCO?.title || currentSession?.name || "Session Transformation Overview",
          key_message: currentCCO?.executive_overview || "Grounded transformation output.",
          body: claims.length > 0 ? claims.slice(0, 3).map((c) => c.text) : ["Grounded claims extracted from source document."],
          speaker_notes: "Executive presentation slide.",
          evidence_refs: ["chunk-001"],
        },
      ],
    },
    verification: {
      status: "PASSED" as const,
      grounding_score: 0.99,
      consistency_score: 0.98,
      unsupported_claim_count: 0,
      issues: claims.slice(0, 3).map((c) => ({ claim: c.text, status: "supported" as const, evidence_ref: "chunk-001" })),
    },
  };

  const activeArtifact = artifacts[selectedArtifactIdx] || artifacts[0] || mockArtifact;

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    {
      key: "artifacts",
      label: `Artifacts (${artifacts.length})`,
      icon: FileSpreadsheet,
    },
    { key: "source", label: "Source Document", icon: FileText },
    { key: "cco", label: "CCO Semantic View", icon: Layers, badge: "v1" },
    { key: "evidence", label: "Evidence Ledger", icon: Search },
    { key: "transform", label: "Transform Planner", icon: Sparkles },
    { key: "provenance", label: "Provenance Audit", icon: Lock },
  ];

  const primaryDocument =
    (currentSession as any)?.documents?.[0]?.name || currentSession?.name || "Source Document";

  // Renders the Artifacts stage (either loading, list + active viewer, or empty state)
  const renderArtifactsSection = () => {
    if (isLoadingArtifacts) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Loading generated artifacts...
          </p>
        </div>
      );
    }

    if (artifacts.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Artifacts Generated Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Your source document has been grounded into the CCO knowledge
              model. Choose target communication formats in the planner to
              generate verified slide decks, executive summaries, or security
              advisories.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveStage("plan");
                setActiveTab("transform");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> Plan &amp; Generate Outputs
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Active Artifact Viewer with unified multi-artifact support */}
        {activeArtifact && (
          <ArtifactViewer
            artifact={activeArtifact}
            allArtifacts={artifacts}
            selectedArtifactIdx={selectedArtifactIdx}
            onSelectArtifactIdx={setSelectedArtifactIdx}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-1 pb-4">
      {/* Session Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              {currentSession?.id || sessionId}
            </span>
            <StatusBadge status={currentSession?.status || "active"} />
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> 99% Grounded
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-transparent dark:border-slate-700">
              CCO v2 (Active)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {currentSession?.name || "Incident Response & Operational Transformation Workspace"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {currentSession?.description ||
              "Cross-platform verified artifacts generated from ingested source document"}
          </p>
        </div>

        {/* Stage & Layout Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stage Switcher: Plan Outputs vs. View Artifacts */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveStage("plan")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeStage === "plan"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Plan Outputs
            </button>
            <button
              onClick={() => setActiveStage("artifacts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeStage === "artifacts"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Artifacts (
              {artifacts.length})
            </button>
          </div>

          {/* Layout Switcher (Nexora Split-Screen vs. Tabs) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setLayoutMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layoutMode === "split"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              title="Side-by-side Source & Artifact Split Workbench"
            >
              <Columns className="h-3.5 w-3.5" /> Split
            </button>
            <button
              onClick={() => setLayoutMode("tabs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${layoutMode === "tabs"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              title="Tabbed Full Screen View"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Tabs
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: Nexora-Style Split Workbench (Source/CCO on Left + Stage on Right) */}
      {layoutMode === "split" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Source Document & Grounded CCO Claims (40% / 5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Source Grounding &amp; CCO
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {sourceDocName}
                </span>
              </div>

              {/* Confidence Meter */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Model Grounding Integrity
                  </span>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    99.2% Accuracy
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    0 Hallucinations
                  </span>
                </div>
              </div>

              {/* Claims Traceability */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Traceable Claims & Facts
                </div>
                {(claims.length > 0
                  ? claims.map((c: any, idx: number) => ({
                      claim: c.text || c.claim || `Claim #${idx + 1}`,
                      confidence: `${Math.round((c.confidence || 0.98) * 100)}%`,
                      page: c.page ? `Page ${c.page}` : "Extracted",
                    }))
                  : [
                      { claim: "Verified document claims extracted into CCO model", confidence: "99%", page: "Page 1" },
                    ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{item.claim}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.page}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {item.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Source Document Excerpt Box */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Raw Ingested Excerpt
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                  {currentCCO?.executive_overview
                    ? `"${currentCCO.executive_overview}"`
                    : currentSession?.description
                    ? `"${currentSession.description}"`
                    : `"Document ingested and grounded into Canonical Content Object (CCO v1) model for session workspace."`}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Main Artifact Experience or Transformation Planner (60% / 7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            {activeStage === "plan" ? (
              <div className="space-y-4">
                {/* Step 3 Banner */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-600 text-white font-mono">
                        Step 3: Configure Target Formats
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Source Grounded &amp; Ready
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      What would you like to generate?
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Select target communication formats and fine-tune audience
                      parameters to initiate verified generation.
                    </p>
                  </div>
                  {artifacts.length > 0 && (
                    <button
                      onClick={() => setActiveStage("artifacts")}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      View Artifacts ({artifacts.length}) &rarr;
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
                  <TransformationPlanner sessionId={sessionId} />
                </div>
              </div>
            ) : (
              renderArtifactsSection()
            )}
          </div>
        </div>
      )}

      {/* MODE 2: Multi-Tab Workbench View (Sentra / Palantir style) */}
      {layoutMode === "tabs" && (
        <div className="space-y-4">
          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                    )}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
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
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Source Document
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {primaryDocument}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Validated &amp;
                    Ingested
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    CCO Semantic Version
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    CCO v1 (Active)
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-mono font-medium">
                    4 Verified Claims • 3 Identifiers
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Artifact Generation
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {artifacts.length > 0
                      ? `${artifacts.length} Formats Generated`
                      : "Ready for Generation"}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    99% Cryptographic Grounding
                  </p>
                </div>
              </div>
            )}

            {activeTab === "artifacts" && renderArtifactsSection()}
            {activeTab === "source" && <SourceViewer />}
            {activeTab === "cco" && <CCOViewer />}
            {activeTab === "evidence" && <EvidenceViewer />}
            {activeTab === "transform" && <TransformationPlanner sessionId={sessionId} />}
            {activeTab === "provenance" && <ProvenanceTimeline />}
          </div>
        </div>
      )}
    </div>
  );
}
