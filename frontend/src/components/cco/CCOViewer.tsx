"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { CheckCircle2, FileText, Layers, Hash, Calendar, ShieldCheck, ExternalLink } from "lucide-react";

export default function CCOViewer() {
  const { currentCCO, setActiveTab } = useSessionStore();

  if (!currentCCO) {
    return <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No CCO data available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-blue-200 bg-blue-50/60 shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider border border-blue-200 font-mono">
              Canonical Content Object
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">Version 2 (Active)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">{currentCCO.title}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">{currentCCO.executive_overview}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">Integrity Hash</div>
            <div className="text-xs font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">{currentCCO.hash}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Claims List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" /> Extracted Semantic Claims ({currentCCO.claims.length})
          </h3>

          <div className="space-y-3">
            {currentCCO.claims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{claim.text}</p>
                      {claim.source_sentence && (
                        <p className="text-[11px] text-slate-600 italic mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          &ldquo;{claim.source_sentence}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-mono">
                    {(claim.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Evidence: <strong className="text-slate-700 font-semibold">Chunk 001 (Page 1)</strong></span>
                  <button
                    onClick={() => setActiveTab("evidence")}
                    className="flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold transition-colors"
                  >
                    Inspect Evidence <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entities, Identifiers & Key Facts (1 col) */}
        <div className="space-y-6">
          {/* Identifiers Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600" /> Deterministic Identifiers
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentCCO.identifiers?.map((id, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-semibold">
                  {id}
                </span>
              ))}
            </div>
          </div>

          {/* Key Findings Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Key Structured Findings
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              {currentCCO.key_findings?.map((kf, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> {kf}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
