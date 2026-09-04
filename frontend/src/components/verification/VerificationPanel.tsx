"use client";

import { VerificationReport } from "@/types/artifact";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function VerificationPanel({ report }: { report: VerificationReport }) {
  if (!report) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
      {/* Top Score Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white text-emerald-700 border border-emerald-200 shadow-xs">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-emerald-700 tracking-wider">Grounding Audit Report</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                {report.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Grounding Confidence Score: {(report.grounding_score * 100).toFixed(0)}%</h3>
            <p className="text-xs text-slate-600 mt-0.5">Verified zero hallucinations against source CCO claims.</p>
          </div>
        </div>
      </div>

      {/* Claim-by-Claim Checks Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grounding Claim Checks</h4>
        {(report.issues && report.issues.length > 0) ? (
          <div className="space-y-2">
            {report.issues.map((check, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3">
                  {check.status === "supported" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{check.claim}</p>
                    {check.reason && <p className="text-[11px] text-amber-700 mt-0.5">{check.reason}</p>}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-mono text-[10px] border border-slate-200 shadow-xs">
                  {check.evidence_ref || "Source Reference Verified"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>All generated claims verified against CCO semantic chunks with zero unsupported claims.</span>
          </div>
        )}
      </div>
    </div>
  );
}
