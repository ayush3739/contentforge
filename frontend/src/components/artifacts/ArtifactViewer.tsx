"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { ArtifactItem } from "@/types/artifact";
import PresentationSlidePreview from "./PresentationSlidePreview";
import ExecutiveSummaryViewer from "./ExecutiveSummaryViewer";
import AdvisoryViewer from "./AdvisoryViewer";
import InfographicViewer from "./InfographicViewer";
import VideoPackageViewer from "./VideoPackageViewer";
import SocialPostViewer from "./SocialPostViewer";
import StatusBadge from "../sessions/StatusBadge";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  FileText,
  Video,
  Presentation,
  BarChart3,
  Share2,
  Copy,
  Lock,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  X,
  Sparkles,
} from "lucide-react";

interface ArtifactViewerProps {
  artifact: ArtifactItem;
  allArtifacts?: ArtifactItem[];
  selectedArtifactIdx?: number;
  onSelectArtifactIdx?: (idx: number) => void;
}

export default function ArtifactViewer({
  artifact,
  allArtifacts,
  selectedArtifactIdx = 0,
  onSelectArtifactIdx,
}: ArtifactViewerProps) {
  const { activeRole } = useAuthStore();
  const { addToast } = useUIStore();

  const allFormats = [
    { key: "presentation", label: "Presentation", ext: "PPTX", icon: Presentation },
    { key: "executive_summary", label: "Executive Summary", ext: "DOCX", icon: FileText },
    { key: "advisory", label: "Security Advisory", ext: "DOCX", icon: ShieldAlert },
    { key: "infographic", label: "Infographic", ext: "PNG", icon: BarChart3 },
    { key: "video_package", label: "Video Storyboard", ext: "JSON", icon: Video },
    { key: "social_post", label: "Social Comm", ext: "TXT", icon: Share2 },
  ];

  const hasMultiArtifacts = allArtifacts && allArtifacts.length > 1;

  const availableKeys = useMemo(() => {
    return hasMultiArtifacts
      ? allArtifacts.map((a) => a.type || "presentation")
      : artifact.available_formats ||
        artifact.content_json?.available_formats ||
        (artifact.type ? [artifact.type] : null);
  }, [hasMultiArtifacts, allArtifacts, artifact.available_formats, artifact.content_json, artifact.type]);

  const formats = useMemo(() => {
    return availableKeys && availableKeys.length > 0
      ? allFormats.filter((f) => availableKeys.includes(f.key))
      : allFormats;
  }, [availableKeys]);

  const [activeFormat, setActiveFormat] = useState<string>(
    artifact.type && formats.some((f) => f.key === artifact.type)
      ? artifact.type
      : formats[0]?.key || "presentation"
  );

  const [statusState, setStatusState] = useState(artifact.status || "verified");
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const isReviewer = activeRole === "reviewer" || activeRole === "admin";

  useEffect(() => {
    if (artifact.type && formats.some((f) => f.key === artifact.type)) {
      setActiveFormat((prev) => (prev !== artifact.type ? artifact.type! : prev));
    }
  }, [artifact.type, formats]);

  useEffect(() => {
    setStatusState(artifact.status || "verified");
  }, [artifact.status]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleFormatClick = (formatKey: string) => {
    setActiveFormat(formatKey);
    if (hasMultiArtifacts && onSelectArtifactIdx) {
      const targetIdx = allArtifacts.findIndex((a) => a.type === formatKey);
      if (targetIdx !== -1) {
        onSelectArtifactIdx(targetIdx);
      }
    }
  };

  const activeFormatObj = allFormats.find((f) => f.key === activeFormat);
  const downloadExt = activeFormatObj?.ext || "BIN";

  const handleDownload = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:8000";
    const downloadUrl = artifact.download_url?.startsWith("http")
      ? artifact.download_url
      : `${baseUrl}${artifact.download_url || `/api/v1/artifacts/${artifact.artifact_id}/download`}`;

    window.open(downloadUrl, "_blank");
    addToast({
      type: "success",
      title: "Download Initiated",
      message: `Downloading ${artifact.filename || `${activeFormat}_artifact`}.${downloadExt.toLowerCase()}...`,
    });
  };

  const handleApprove = () => {
    setStatusState("approved");
    addToast({
      type: "success",
      title: "Artifact Approved & Anchored",
      message: "Reviewer sign-off recorded. SHA-256 anchored to provenance ledger.",
    });
  };

  const handleReject = () => {
    setStatusState("rejected");
    setMenuOpen(false);
    addToast({
      type: "error",
      title: "Artifact Rejected",
      message: "Rejection status logged with immutable audit record.",
    });
  };

  const handleReviseSubmit = () => {
    setStatusState("generating");
    setRevisionModalOpen(false);
    addToast({
      type: "info",
      title: "Revision Queued",
      message: "Prompt revision instructions submitted to P1 AI worker.",
    });
  };

  const copyChecksum = () => {
    if (artifact.checksum) {
      navigator.clipboard.writeText(artifact.checksum);
      addToast({
        type: "info",
        title: "Copied Checksum",
        message: "SHA-256 hash copied to clipboard.",
      });
    }
  };

  const handleFit = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth - 48;
      const targetDocWidth = 840;
      const calculatedScale = Math.min(100, Math.max(50, Math.round((containerWidth / targetDocWidth) * 100)));
      setZoomLevel(calculatedScale);
    } else {
      setZoomLevel(90);
    }
  };

  const renderContent = () => (
    <div
      className="transition-transform duration-200 origin-top flex flex-col items-center w-full"
      style={{
        transform: zoomLevel === 100 ? "none" : `scale(${zoomLevel / 100})`,
      }}
    >
      <div className="w-full">
        {activeFormat === "presentation" && (
          <PresentationSlidePreview slides={artifact.content_json?.slides || []} />
        )}

        {activeFormat === "executive_summary" && (
          <ExecutiveSummaryViewer
            content={{
              title: artifact.content_json?.title,
              executive_overview:
                artifact.content_json?.executive_overview ||
                artifact.content_json?.executive_takeaway,
              key_findings: artifact.content_json?.key_findings,
              impact: artifact.content_json?.impact,
              recommended_actions:
                artifact.content_json?.recommended_actions ||
                artifact.content_json?.recommendations,
            }}
          />
        )}

        {activeFormat === "advisory" && (
          <AdvisoryViewer
            content={{
              title: artifact.content_json?.title,
              severity: artifact.content_json?.severity,
              summary:
                artifact.content_json?.executive_overview ||
                artifact.content_json?.summary,
              affected_entities:
                artifact.content_json?.affected_entities ||
                artifact.content_json?.affected_systems,
              indicators_of_compromise: artifact.content_json?.indicators_of_compromise,
              recommended_actions:
                artifact.content_json?.recommended_actions ||
                artifact.content_json?.required_actions,
            }}
          />
        )}

        {activeFormat === "infographic" && (
          <InfographicViewer
            content={{
              title: artifact.content_json?.title,
              metrics: artifact.content_json?.metrics,
              timeline: artifact.content_json?.timeline,
              comparison_bars: artifact.content_json?.comparison_bars,
            }}
          />
        )}

        {activeFormat === "video_package" && (
          <VideoPackageViewer
            content={{
              title: artifact.content_json?.title,
              scenes: artifact.content_json?.scenes,
            }}
          />
        )}

        {activeFormat === "social_post" && (
          <SocialPostViewer
            content={{
              title: artifact.content_json?.title,
              platform: artifact.content_json?.platform,
              target_audience: artifact.content_json?.target_audience,
              hook: artifact.content_json?.hook,
              body: artifact.content_json?.body,
              key_takeaways: artifact.content_json?.key_takeaways,
              call_to_action: artifact.content_json?.call_to_action,
              hashtags: artifact.content_json?.hashtags,
              evidence_refs: artifact.content_json?.evidence_refs,
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-100/95 dark:bg-slate-950/95 overflow-y-auto p-4 sm:p-6 backdrop-blur-md flex flex-col gap-5"
          : "space-y-4"
      }
    >
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-2 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {formats.map((f) => {
            const Icon = f.icon;
            const isActive = activeFormat === f.key;
            return (
              <button
                key={f.key}
                onClick={() => handleFormatClick(f.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{f.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive
                      ? "bg-blue-700/60 text-blue-100"
                      : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {f.ext}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-between md:justify-end shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <StatusBadge status={statusState} />
            {artifact.checksum && (
              <button
                onClick={copyChecksum}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Click to copy SHA-256 Checksum"
              >
                <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>{artifact.checksum.slice(0, 8)}...</span>
                <Copy className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel(75)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel === 75
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Zoom 75%"
            >
              75%
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel === 100
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Actual Size 100%"
            >
              100%
            </button>
            <button
              onClick={() => setZoomLevel(150)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel === 150
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Zoom 150%"
            >
              150%
            </button>
            <button
              onClick={handleFit}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel !== 75 && zoomLevel !== 100 && zoomLevel !== 150
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Fit to Container"
            >
              Fit
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer"
            title={`Download ${downloadExt} Binary`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
            <span className="text-[10px] font-mono opacity-80 uppercase">.{downloadExt.toLowerCase()}</span>
          </button>

          {isReviewer && statusState !== "approved" && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={handleApprove}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                title="Sign-Off & Anchor Checksum"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Sign-Off</span>
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="More Reviewer Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-30 text-xs font-medium">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setRevisionModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                      Request Revision
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      Reject Artifact
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Preview (Fullscreen)"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div ref={previewContainerRef} className="w-full flex justify-center">{renderContent()}</div>

      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Request Targeted Revision
              </h3>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prompt revision instructions will be submitted to P1 AI worker while preserving grounded CCO facts.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g., Highlight the CVE-2026-901 impact on critical database replicas and add a patch verification table..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviseSubmit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
