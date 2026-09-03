"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { CheckCircle2, FileText, Layers, Hash, Calendar, ShieldCheck, ExternalLink } from "lucide-react";

export default function CCOViewer() {
  const { currentCCO, setActiveTab } = useSessionStore();

  if (!currentCCO) {
    return <div className="p-8 text-center text-slate-400">No CCO data available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
              Canonical Content Object
            </span>
            <span className="text-xs text-slate-400 font-mono">Version 2 (Active)</span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mt-1">{currentCCO.title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentCCO.executive_overview}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-mono">Integrity Hash</div>
            <div className="text-xs font-mono font-semibold text-cyan-400">{currentCCO.hash}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Claims List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" /> Extracted Semantic Claims ({currentCCO.claims.length})
          </h3>

          <div className="space-y-3">
            {currentCCO.claims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{claim.text}</p>
                      {claim.source_sentence && (
                        <p className="text-[11px] text-slate-400 italic mt-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                          &ldquo;{claim.source_sentence}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {(claim.confidence * 100).toFixed(0)}% Conf
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                  <span>Evidence: <strong className="text-slate-300">Chunk 001 (Page 1)</strong></span>
                  <button
                    onClick={() => setActiveTab("evidence")}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
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
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Hash className="h-4 w-4 text-cyan-400" /> Deterministic Identifiers
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentCCO.identifiers?.map((id, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-semibold">
                  {id}
                </span>
              ))}
            </div>
          </div>

          {/* Key Findings Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Key Structured Findings
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {currentCCO.key_findings?.map((kf, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {kf}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
