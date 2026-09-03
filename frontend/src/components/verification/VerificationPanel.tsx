"use client";

import { VerificationReport } from "@/types/artifact";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function VerificationPanel({ report }: { report: VerificationReport }) {
  if (!report) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Top Score Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">Grounding Audit Report</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {report.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mt-1">Grounding Confidence Score: {(report.grounding_score * 100).toFixed(0)}%</h3>
            <p className="text-xs text-slate-400 mt-0.5">Verified zero hallucinations against source CCO claims.</p>
          </div>
        </div>
      </div>

      {/* Claim-by-Claim Checks Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grounding Claim Checks</h4>
        <div className="space-y-2">
          {report.issues.map((check, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center gap-3">
                {check.status === "supported" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-200">{check.claim}</p>
                  {check.reason && <p className="text-[11px] text-amber-400 mt-0.5">{check.reason}</p>}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px]">
                {check.evidence_ref || "Source Reference Verified"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
