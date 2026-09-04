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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 font-mono">
              Visual Data Package
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Grounded In CCO
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs w-fit"
        >
          <Download className="h-4 w-4 text-slate-500" /> Export Graphic
        </button>
      </div>

      {/* 4 Large Visual Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white shadow-xs space-y-2 text-center"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">{m.label}</span>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{m.value}</div>
            <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 py-1 px-2 rounded-lg border border-blue-100 inline-block">
              {m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Timeline Diagram */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" /> 24-Hour Incident Progression
        </h3>
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">00:00 - T0</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Anomaly Detected</h4>
              <p className="text-[11px] text-slate-500 mt-1">SIEM identified outbound beaconing across 14 payment nodes.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">04:30 - T+4h</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Network Quarantine</h4>
              <p className="text-[11px] text-slate-500 mt-1">Ingress/egress blocked. Traffic rerouted to secondary clusters.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">24:00 - T+24h</span>
              <h4 className="text-xs font-bold text-slate-800 mt-2">Patch Deployment</h4>
              <p className="text-[11px] text-slate-500 mt-1">Patch KB-9912 applied. 100% services restored cleanly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
