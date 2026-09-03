"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { ArtifactItem } from "@/types/artifact";
import PresentationSlidePreview from "./PresentationSlidePreview";
import StatusBadge from "../sessions/StatusBadge";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  FileText,
  Video,
  Share2,
  BarChart3,
} from "lucide-react";

export default function ArtifactViewer({ artifact }: { artifact: ArtifactItem }) {
  const { activeRole } = useAuthStore();
  const { addToast } = useUIStore();
  const [statusState, setStatusState] = useState(artifact.status);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  const isReviewer = activeRole === "reviewer" || activeRole === "admin";

  const handleDownload = () => {
    addToast({ type: "success", title: "Download Started", message: `Downloading ${artifact.filename}...` });
  };

  const handleApprove = () => {
    setStatusState("approved");
    addToast({ type: "success", title: "Artifact Approved", message: "Reviewer sign-off recorded in audit log." });
  };

  const handleReject = () => {
    setStatusState("rejected");
    addToast({ type: "error", title: "Artifact Rejected", message: "Rejection status logged." });
  };

  const handleReviseSubmit = () => {
    setStatusState("generating");
    setRevisionModalOpen(false);
    addToast({ type: "info", title: "Revision Submitted", message: "Prompt revision queued for regeneration." });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-cyan-400 font-bold uppercase">{artifact.type}</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Version {artifact.version}</span>
            <StatusBadge status={statusState} />
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-1">{artifact.filename}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="h-4 w-4" /> Download Binary
          </button>

          {isReviewer && statusState !== "approved" && (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => setRevisionModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Revise
              </button>
              <button
                onClick={handleReject}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        {artifact.type === "presentation" ? (
          <PresentationSlidePreview slides={artifact.content_json?.slides || []} />
        ) : artifact.type === "video_package" ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-400" /> Video Storyboard Package
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400">Scene 01 (00:00 - 00:08)</span>
                <p className="text-xs text-slate-200 font-medium">Visual: Animated infrastructure breach diagram showing 14 isolated nodes.</p>
                <p className="text-xs text-slate-400 italic bg-slate-900 p-2.5 rounded-lg">&ldquo;On August 14, unauthorized activity affected 14 payment nodes...&rdquo;</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400">Scene 02 (00:08 - 00:15)</span>
                <p className="text-xs text-slate-200 font-medium">Visual: Financial risk counter capping impact at $2.5 million.</p>
                <p className="text-xs text-slate-400 italic bg-slate-900 p-2.5 rounded-lg">&ldquo;Immediate remediation isolated affected nodes within 24 hours...&rdquo;</p>
              </div>
            </div>
          </div>
        ) : artifact.type === "infographic" ? (
          <div className="space-y-4 text-center p-6 border border-slate-800 bg-slate-950 rounded-xl">
            <BarChart3 className="h-10 w-10 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-100">Visual Infographic Render Preview</h3>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto my-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-lg">14 Nodes</div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-lg">$2.5M Impact</div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-lg">24 Hours</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100">{artifact.content_json?.title || artifact.filename}</h3>
            <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-5 rounded-xl border border-slate-800">
              {JSON.stringify(artifact.content_json, null, 2)}
            </div>
          </div>
        )}
      </div>

      {/* Revision Modal */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Request Prompt Revision</h3>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Describe requested adjustments (e.g. Add slide for financial impact breakdown)..."
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviseSubmit}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Submit Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
