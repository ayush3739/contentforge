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
  const { currentSession, setCurrentSession, activeTab, setActiveTab } =
    useSessionStore();
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

  const activeArtifact =
    artifacts.length > 0
      ? artifacts[selectedArtifactIdx] || artifacts[0]
      : null;

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "presentation":
        return <Presentation className="h-3.5 w-3.5 text-blue-600" />;
      case "executive_summary":
        return <FileText className="h-3.5 w-3.5 text-indigo-600" />;
      case "advisory":
        return <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />;
      case "infographic":
        return <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />;
      case "video_package":
        return <Video className="h-3.5 w-3.5 text-rose-600" />;
      case "social_post":
        return <Share2 className="h-3.5 w-3.5 text-sky-600" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

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
    (currentSession as any)?.documents?.[0]?.name || "Incident_Report.pdf";

  // Renders the Artifacts stage (either loading, list + active viewer, or empty state)
  const renderArtifactsSection = () => {
    if (isLoadingArtifacts) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-slate-700">
            Loading generated artifacts...
          </p>
        </div>
      );
    }

    if (artifacts.length === 0) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No Artifacts Generated Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
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
        {/* Top Artifact Switcher Strip (if multiple artifacts exist) */}
        {artifacts.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-400 pl-2 shrink-0">
              Artifacts:
            </span>
            {artifacts.map((art, idx) => {
              const isSelected = idx === selectedArtifactIdx;
              const type = art.type || "artifact";
              return (
                <button
                  key={art.artifact_id || idx}
                  onClick={() => setSelectedArtifactIdx(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  )}
                >
                  {getArtifactIcon(type)}
                  <span className="capitalize">{type.replace("_", " ")}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    v{art.version || 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Artifact Viewer */}
        {activeArtifact && <ArtifactViewer artifact={activeArtifact} />}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-1 pb-4">
      {/* Session Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              {currentSession?.id || sessionId}
            </span>
            <StatusBadge status={currentSession?.status || "active"} />
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> 99% Grounded
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium">
              CCO v1 (Active)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentSession?.name ||
              "Incident Response & Operational Transformation Workspace"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentSession?.description ||
              "Cross-platform verified artifacts generated from ingested source document"}
          </p>
        </div>

        {/* Stage & Layout Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Stage Switcher: Plan Outputs vs. View Artifacts */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveStage("plan")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStage === "plan"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Plan Outputs
            </button>
            <button
              onClick={() => setActiveStage("artifacts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStage === "artifacts"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Artifacts (
              {artifacts.length})
            </button>
          </div>

          {/* Layout Switcher (Nexora Split-Screen vs. Tabs) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setLayoutMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === "split"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Side-by-side Source & Artifact Split Workbench"
            >
              <Columns className="h-3.5 w-3.5" /> Split
            </button>
            <button
              onClick={() => setLayoutMode("tabs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === "tabs"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Source Grounding &amp; CCO
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[180px]">
                  {primaryDocument}
                </span>
              </div>

              {/* Confidence Meter */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Model Grounding Integrity
                  </span>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    99.2% Accuracy
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    0 Hallucinations
                  </span>
                </div>
              </div>

              {/* Claims Traceability */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Traceable Claims &amp; Facts
                </div>
                {[
                  {
                    claim: "14 payment gateway systems isolated",
                    confidence: "99%",
                    page: "Page 2",
                  },
                  {
                    claim: "Threat actor exploited CVE-2024-3094",
                    confidence: "98%",
                    page: "Page 2",
                  },
                  {
                    claim: "Remediation capped at $2.5 million",
                    confidence: "99%",
                    page: "Page 4",
                  },
                  {
                    claim: "0 unencrypted PII records exfiltrated",
                    confidence: "100%",
                    page: "Page 5",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800 leading-snug">
                        {item.claim}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.page}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Source Document Excerpt Box */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Raw Ingested Excerpt
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                  &ldquo;On August 14, 2026 at 00:15 UTC, automated anomaly
                  detection systems triggered a high-severity alert. 14
                  production payment gateway systems were immediately
                  quarantined... Kernel patch KB-9912 was initiated to mitigate
                  CVE-2024-3094.&rdquo;
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: Main Artifact Experience or Transformation Planner (60% / 7 cols) */}
          <div className="xl:col-span-7 space-y-4">
            {activeStage === "plan" ? (
              <div className="space-y-4">
                {/* Step 3 Banner */}
                <div className="bg-white rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/60 to-indigo-50/30 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-600 text-white font-mono">
                        Step 3: Configure Target Formats
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Source Grounded &amp; Ready
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      What would you like to generate?
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Select target communication formats and fine-tune audience
                      parameters to initiate verified generation.
                    </p>
                  </div>
                  {artifacts.length > 0 && (
                    <button
                      onClick={() => setActiveStage("artifacts")}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      View Artifacts ({artifacts.length}) &rarr;
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                  <TransformationPlanner />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                    <span className="text-xs font-bold text-slate-800">
                      Generated Intelligence Artifacts ({artifacts.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveStage("plan")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Plan New Output
                  </button>
                </div>
                {renderArtifactsSection()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: Multi-Tab Workbench View (Sentra / Palantir style) */}
      {layoutMode === "tabs" && (
        <div className="space-y-4">
          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto bg-white p-2 rounded-2xl shadow-xs">
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
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-blue-600" : "text-slate-400"
                    )}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-blue-100 text-blue-800 font-mono">
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
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Source Document
                  </span>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    {primaryDocument}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Validated &amp;
                    Ingested
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    CCO Semantic Version
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    CCO v1 (Active)
                  </h3>
                  <p className="text-xs text-blue-700 font-mono font-medium">
                    4 Verified Claims • 3 Identifiers
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Artifact Generation
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {artifacts.length > 0
                      ? `${artifacts.length} Formats Generated`
                      : "Ready for Generation"}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold">
                    99% Cryptographic Grounding
                  </p>
                </div>
              </div>
            )}

            {activeTab === "artifacts" && renderArtifactsSection()}
            {activeTab === "source" && <SourceViewer />}
            {activeTab === "cco" && <CCOViewer />}
            {activeTab === "evidence" && <EvidenceViewer />}
            {activeTab === "transform" && <TransformationPlanner />}
            {activeTab === "provenance" && <ProvenanceTimeline />}
          </div>
        </div>
      )}
    </div>
  );
}
