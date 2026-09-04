"use client";

import React from "react";
import { BarChart3, ShieldCheck, TrendingDown, Clock, Activity, Download } from "lucide-react";

interface InfographicViewerProps {
  content: {
    title?: string;
    metrics?: Array<{ label: string; value: string; trend?: string; color?: string }>;
    summary?: string;
    timeline?: Array<{ time: string; event: string }>;
  };
}

export default function InfographicViewer({ content }: InfographicViewerProps) {
  const title = content?.title || "Incident Response & Operational Impact Infographic";
  const metrics = content?.metrics || [
    { label: "Systems Quarantined", value: "14", trend: "Targeted Isolation", color: "blue" },
    { label: "Financial Cap", value: "$2.5M", trend: "Remediation Ceiling", color: "emerald" },
    { label: "Response Window", value: "24h", trend: "Detection to Containment", color: "purple" },
    { label: "Customer PII Leaks", value: "0", trend: "100% Cryptographically Verified", color: "teal" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono">
              Visual Data Package
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Grounded In CCO
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs w-fit"
        >
          <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Export Graphic
        </button>
      </div>

      {/* 4 Large Visual Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900 shadow-xs space-y-2 text-center"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{m.label}</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{m.value}</div>
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 py-1 px-2 rounded-lg border border-blue-100 dark:border-blue-800 inline-block">
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Timeline Diagram */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 24-Hour Incident Progression
        </h3>
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">00:00 - T0</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2">Anomaly Detected</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">SIEM identified outbound beaconing across 14 payment nodes.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">04:30 - T+4h</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2">Network Quarantine</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ingress/egress blocked. Traffic rerouted to secondary clusters.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">24:00 - T+24h</span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2">Patch Deployment</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Patch KB-9912 applied. 100% services restored cleanly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
