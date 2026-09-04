"use client";

import React, { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSessionStore } from "@/store/useSessionStore";
import { fetchTransformationStatus, API_BASE_URL } from "@/lib/api";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  FileText,
  Presentation,
  ShieldAlert,
  BarChart3,
  Video,
  Share2,
  ExternalLink,
} from "lucide-react";

export default function TransformationProgressPage({
  params,
}: {
  params: Promise<{ transformationId: string }>;
}) {
  const { transformationId } = use(params);
  const router = useRouter();
  const { currentSession } = useSessionStore();

  const [statusState, setStatusState] = useState<{
    transformation_id: string;
    session_id?: string;
    status: string;
    progress_percentage: number;
    message: string;
    artifacts: any[];
    error?: string;
  }>({
    transformation_id: transformationId,
    status: "PROCESSING",
    progress_percentage: 15,
    message: "Initializing transformation pipeline...",
    artifacts: [],
  });

  const [pollError, setPollError] = useState<string | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const handleUpdate = (data: any) => {
      setStatusState((prev) => ({
        ...prev,
        ...data,
        progress_percentage:
          data.progress_percentage ??
          (data.status === "COMPLETED"
            ? 100
            : data.status === "GENERATING"
            ? 60
            : data.status === "VERIFYING"
            ? 80
            : data.status === "FAILED"
            ? 0
            : 35),
        message:
          data.message ||
          (data.status === "COMPLETED"
            ? "Transformation processing completed!"
            : data.status === "FAILED"
            ? "Transformation pipeline failed."
            : "Generating structured outputs & artifact schemas..."),
        artifacts: data.artifacts || [],
      }));
      setPollError(null);
    };

    const startPolling = () => {
      if (pollInterval) return;
      const poll = async () => {
        try {
          const data = await fetchTransformationStatus(transformationId);
          handleUpdate(data);
          if (["COMPLETED", "FAILED", "REVIEW_REQUIRED"].includes(data.status)) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
        } catch (err: any) {
          console.error("Polling error:", err);
          setPollError("Connection issue while checking job status. Retrying...");
        }
      };
      poll();
      pollInterval = setInterval(poll, 2500);
    };

    // Attempt live Server-Sent Events (SSE) stream first
    try {
      const sseUrl = `${API_BASE_URL}/transformations/${transformationId}/stream`;
      es = new EventSource(sseUrl);

      es.addEventListener("progress", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handleUpdate(data);
          if (["COMPLETED", "FAILED", "REVIEW_REQUIRED"].includes(data.status)) {
            es?.close();
            es = null;
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      });

      es.addEventListener("complete", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handleUpdate(data);
        } catch {}
        es?.close();
        es = null;
      });

      es.onerror = () => {
        // SSE disconnected or unsupported — seamlessly fall back to interval polling
        es?.close();
        es = null;
        startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      if (es) es.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [transformationId]);

  const steps = [
    { label: "QUEUED", done: true },
    {
      label: "PROCESSING",
      done:
        statusState.progress_percentage >= 25 ||
        statusState.status !== "QUEUED",
    },
    {
      label: "GENERATING",
      done:
        statusState.progress_percentage >= 50 ||
        ["GENERATING", "VERIFYING", "RENDERING", "COMPLETED"].includes(
          statusState.status
        ),
    },
    {
      label: "VERIFYING",
      done:
        statusState.progress_percentage >= 75 ||
        ["VERIFYING", "RENDERING", "COMPLETED"].includes(statusState.status),
    },
    {
      label: "RENDERING",
      done:
        statusState.progress_percentage >= 90 ||
        ["RENDERING", "COMPLETED"].includes(statusState.status),
    },
    { label: "COMPLETED", done: statusState.status === "COMPLETED" },
  ];

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "presentation":
        return <Presentation className="h-5 w-5 text-blue-600" />;
      case "executive_summary":
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case "advisory":
        return <ShieldAlert className="h-5 w-5 text-amber-600" />;
      case "infographic":
        return <BarChart3 className="h-5 w-5 text-emerald-600" />;
      case "video_package":
        return <Video className="h-5 w-5 text-rose-600" />;
      case "social_post":
        return <Share2 className="h-5 w-5 text-sky-600" />;
      default:
        return <FileText className="h-5 w-5 text-slate-600" />;
    }
  };

  const targetSessionId =
    statusState.session_id || currentSession?.id || "";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="font-mono text-xs text-blue-700 font-bold uppercase">
          {transformationId}
        </span>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">
          Transformation Engine Execution
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Multi-output transformation pipeline running AI synthesis &amp; verification
        </p>
      </div>

      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {statusState.status === "COMPLETED" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : statusState.status === "FAILED" ? (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            )}
            <span className="font-bold text-slate-800">
              {statusState.message}
            </span>
          </div>
          <span className="font-mono font-bold text-blue-700 text-sm">
            {statusState.progress_percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ${
              statusState.status === "FAILED"
                ? "bg-rose-500"
                : "bg-gradient-to-r from-blue-600 to-emerald-500"
            }`}
            style={{ width: `${statusState.progress_percentage}%` }}
          />
        </div>

        {/* Stepper Status Badges */}
        <div className="grid grid-cols-6 gap-2 pt-2">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center text-[10px] font-bold font-mono transition-all ${
                s.done
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Polling Warning */}
        {pollError && (
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{pollError}</span>
          </div>
        )}

        {/* Generated Artifacts List */}
        {statusState.status === "COMPLETED" && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Generated Communication Artifacts ({statusState.artifacts.length})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Each artifact is mathematically grounded in CCO v1 and cryptographically verified.
              </p>
            </div>

            {statusState.artifacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {statusState.artifacts.map((art: any, idx: number) => {
                  const artId = art.artifact_id || art.id || `ART-${idx + 1}`;
                  const artType = art.type || "artifact";
                  return (
                    <div
                      key={artId}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                          {getArtifactIcon(artType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {artId}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              {artType.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Status: <span className="font-semibold text-emerald-600">{art.status || "verified"}</span>
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/artifacts/${artId}`}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition-all"
                        title="View Artifact"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                Artifacts generated successfully. Open the workspace to view them.
              </div>
            )}
          </div>
        )}

        {/* Action button when completed */}
        {statusState.status === "COMPLETED" && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (targetSessionId) {
                  router.push(`/sessions/${targetSessionId}?view=artifacts`);
                } else {
                  router.push("/sessions");
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Open Artifact Workspace <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Action buttons when failed */}
        {statusState.status === "FAILED" && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (targetSessionId) {
                  router.push(`/sessions/${targetSessionId}`);
                } else {
                  router.push("/sessions");
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Return to Workspace
            </button>
            <button
              onClick={() => {
                if (targetSessionId) {
                  router.push(`/sessions/${targetSessionId}?view=transform`);
                } else {
                  router.push("/sessions/new");
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Retry Output Generation <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
