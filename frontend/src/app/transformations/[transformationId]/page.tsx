"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { fetchTransformationStatus } from "@/lib/api";
import { Cpu, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function TransformationProgressPage({ params }: { params: Promise<{ transformationId: string }> }) {
  const { transformationId } = use(params);
  const router = useRouter();
  const { currentSession } = useSessionStore();
  const [statusState, setStatusState] = useState<any>({
    transformation_id: transformationId,
    status: "PROCESSING",
    progress_percentage: 45,
    message: "Generating structured outputs & slide schemas...",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatusState({
        transformation_id: transformationId,
        status: "COMPLETED",
        progress_percentage: 100,
        message: "Transformation processing completed!",
        artifacts: [
          { artifact_id: "ART-001", type: "presentation", status: "verified", filename: "presentation_ART-001.pptx" },
          { artifact_id: "ART-002", type: "executive_summary", status: "verified", filename: "executive_summary_ART-002.pdf" },
        ],
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [transformationId]);

  const steps = [
    { label: "QUEUED", done: true },
    { label: "PROCESSING", done: true },
    { label: "GENERATING", done: statusState.progress_percentage >= 50 },
    { label: "VERIFYING", done: statusState.progress_percentage >= 75 },
    { label: "RENDERING", done: statusState.progress_percentage >= 90 },
    { label: "COMPLETED", done: statusState.status === "COMPLETED" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="font-mono text-xs text-blue-700 font-bold uppercase">{transformationId}</span>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">Transformation Engine Execution</h1>
        <p className="text-xs text-slate-500 mt-1">Multi-output transformation pipeline running background jobs</p>
      </div>

      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {statusState.status === "COMPLETED" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            )}
            <span className="font-bold text-slate-800">{statusState.message}</span>
          </div>
          <span className="font-mono font-bold text-blue-700 text-sm">{statusState.progress_percentage}%</span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
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

        {/* Action button when completed */}
        {statusState.status === "COMPLETED" && (
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => router.push(`/sessions/${currentSession?.id || "SES-INCIDENT-88412"}?view=artifacts`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              Open Artifact Workspace <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
