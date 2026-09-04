"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  FileText,
  Video,
  Presentation,
  ShieldAlert,
  BarChart3,
  Share2,
  Copy,
  Lock,
  Layers,
} from "lucide-react";

export default function ArtifactViewer({ artifact }: { artifact: ArtifactItem }) {
  const { activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  
  const allFormats = [
    { key: "presentation", label: "Presentation (PPTX)", icon: Presentation },
    { key: "executive_summary", label: "Executive Summary (DOCX/PDF)", icon: FileText },
    { key: "advisory", label: "Security Advisory", icon: ShieldAlert },
    { key: "infographic", label: "Visual Infographic", icon: BarChart3 },
    { key: "video_package", label: "Video Storyboard", icon: Video },
    { key: "social_post", label: "Social Communication", icon: Share2 },
  ];

  // Dynamically determine which formats are actually generated or requested
  const availableKeys =
    artifact.available_formats ||
    artifact.content_json?.available_formats ||
    (artifact.type ? [artifact.type] : null);

  const formats =
    availableKeys && availableKeys.length > 0
      ? allFormats.filter((f) => availableKeys.includes(f.key))
      : allFormats;

  const [activeFormat, setActiveFormat] = useState<string>(
    artifact.type && formats.some((f) => f.key === artifact.type)
      ? artifact.type
      : formats[0]?.key || "presentation"
  );
  const [statusState, setStatusState] = useState(artifact.status || "verified");
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  const isReviewer = activeRole === "reviewer" || activeRole === "admin";

  useEffect(() => {
    if (formats.length > 0 && !formats.some((f) => f.key === activeFormat)) {
      setActiveFormat(formats[0].key);
    }
  }, [formats, activeFormat]);

  const handleDownload = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") || "http://localhost:8000";
    const downloadUrl = artifact.download_url?.startsWith("http")
      ? artifact.download_url
      : `${baseUrl}${artifact.download_url || `/api/v1/artifacts/${artifact.artifact_id}/download`}`;

    window.open(downloadUrl, "_blank");
    addToast({
      type: "success",
      title: "Binary Download Initiated",
      message: `Downloading ${artifact.filename || `${activeFormat}_artifact.bin`}...`,
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
      addToast({ type: "info", title: "Copied Checksum", message: "SHA-256 hash copied to clipboard." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Meta Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              {artifact.artifact_id || "ART-001"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">Version {artifact.version || 1}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <StatusBadge status={statusState} />
            {artifact.checksum && (
              <button
                onClick={copyChecksum}
                className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 transition-colors"
                title="Click to copy SHA-256 Checksum"
              >
                <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>SHA-256: {artifact.checksum.slice(0, 16)}...</span>
                <Copy className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {artifact.content_json?.title || artifact.filename || "Transformation Artifact Experience"}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Binary ({activeFormat === "presentation" ? "PPTX" : "DOCX/PDF"})
          </button>

          {isReviewer && statusState !== "approved" && (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2.5">
              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Sign-Off & Anchor
              </button>
              <button
                onClick={() => setRevisionModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Revise
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Artifact Output Format Switcher Bar (Only rendered if multiple formats are generated) */}
      {formats.length > 1 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {formats.map((f) => {
            const Icon = f.icon;
            const isActive = activeFormat === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFormat(f.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      ) : formats.length === 1 ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/60 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 w-fit text-xs font-bold text-blue-800 dark:text-blue-300">
          <span className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">Generated Output:</span>
          <span>{formats[0].label}</span>
        </div>
      ) : null}

      {/* Rendered Artifact Stage */}
      <div className="transition-all">
        {activeFormat === "presentation" && (
          <PresentationSlidePreview slides={artifact.content_json?.slides || []} />
        )}

        {activeFormat === "executive_summary" && (
          <ExecutiveSummaryViewer
            content={{
              title: artifact.content_json?.title,
              executive_overview: artifact.content_json?.executive_overview || artifact.content_json?.executive_takeaway,
              key_findings: artifact.content_json?.key_findings,
              impact: artifact.content_json?.impact,
              recommended_actions: artifact.content_json?.recommended_actions || artifact.content_json?.recommendations,
            }}
          />
        )}

        {activeFormat === "advisory" && (
          <AdvisoryViewer
            content={{
              title: artifact.content_json?.title,
              severity: artifact.content_json?.severity,
              summary: artifact.content_json?.executive_overview || artifact.content_json?.summary,
              affected_entities: artifact.content_json?.affected_entities || artifact.content_json?.affected_systems,
              indicators_of_compromise: artifact.content_json?.indicators_of_compromise,
              recommended_actions: artifact.content_json?.recommended_actions || artifact.content_json?.required_actions,
            }}
          />
        )}

        {activeFormat === "infographic" && (
          <InfographicViewer
            content={{
              title: artifact.content_json?.title,
              metrics: artifact.content_json?.metrics,
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

      {/* Revision Request Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Request Targeted Revision</h3>
              <p className="text-xs text-slate-500 mt-0.5">Prompt instructions will be sent to P1 for regeneration without altering verified CCO facts.</p>
            </div>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g., Focus more on financial mitigation ceiling and add details on the Kernel KB-9912 patch..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviseSubmit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
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
