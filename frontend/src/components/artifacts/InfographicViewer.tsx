"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  BarChart3,
  Clock,
  Download,
} from "lucide-react";

interface InfographicViewerProps {
  content: {
    title?: string;
    metrics?: Array<{ label: string; value: string; trend?: string; color?: string; percent?: number }>;
    summary?: string;
    timeline?: Array<{ time: string; event: string; detail?: string; status?: "critical" | "warning" | "success" }>;
    comparison_bars?: Array<{ label: string; value: string; percent: number; color?: string }>;
  };
}

export default function InfographicViewer({ content }: InfographicViewerProps) {
  const graphicRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const title = content?.title || "Incident Response & Operational Impact Infographic";
  const metrics = content?.metrics || [
    { label: "Systems Quarantined", value: "14", trend: "Targeted Isolation", color: "blue", percent: 88 },
    { label: "Financial Cap", value: "$2.5M", trend: "Remediation Ceiling", color: "emerald", percent: 95 },
    { label: "Response Window", value: "24h", trend: "T0 to Containment", color: "purple", percent: 100 },
    { label: "Customer PII Leaks", value: "0", trend: "Cryptographically Verified", color: "teal", percent: 100 },
  ];

  const timeline = content?.timeline || [
    {
      time: "00:00 (T0)",
      event: "Anomaly Detected",
      detail: "SIEM outbound beaconing detected across 14 payment nodes.",
      status: "critical",
    },
    {
      time: "04:30 (T+4h)",
      event: "Network Quarantine",
      detail: "Ingress/egress blocked. Traffic rerouted to secondary clusters.",
      status: "warning",
    },
    {
      time: "12:00 (T+12h)",
      event: "CCO Fact Verification",
      detail: "Root cause isolated to CVE-2024-3094. Ingested to provenance chain.",
      status: "warning",
    },
    {
      time: "24:00 (T+24h)",
      event: "100% Remediation",
      detail: "Patch KB-9912 deployed. All services fully validated & active.",
      status: "success",
    },
  ];

  const comparisonBars = content?.comparison_bars || (
    content?.metrics && content.metrics.length > 0
      ? content.metrics.map((m) => {
          const numericPart = parseInt(m.value.replace(/[^0-9]/g, "") || "85", 10);
          return {
            label: m.label,
            value: m.value + (m.trend ? ` (${m.trend})` : ""),
            percent: m.percent ?? Math.min(100, Math.max(15, numericPart > 100 ? 95 : numericPart)),
            color: m.color || "blue",
          };
        })
      : [
          { label: "Database Cluster Isolation Integrity", value: "100% (14/14 nodes)", percent: 100, color: "blue" },
          { label: "Source Evidence CCO Grounding", value: "99.2% (0 Hallucinations)", percent: 99.2, color: "emerald" },
          { label: "Customer Data Safeguard Level", value: "100% (Zero Exfiltration)", percent: 100, color: "teal" },
          { label: "SLA Recovery Efficiency", value: "94.8% (42m Diverted)", percent: 94.8, color: "purple" },
        ]
  );

  const getBarColorClasses = (color?: string) => {
    switch (color) {
      case "emerald":
        return { text: "text-emerald-600", bar: "bg-emerald-600" };
      case "teal":
        return { text: "text-teal-600", bar: "bg-teal-600" };
      case "purple":
        return { text: "text-purple-600", bar: "bg-purple-600" };
      case "amber":
        return { text: "text-amber-600", bar: "bg-amber-600" };
      case "rose":
      case "red":
        return { text: "text-rose-600", bar: "bg-rose-600" };
      default:
        return { text: "text-blue-600", bar: "bg-blue-600" };
    }
  };

  // Radial chart helper
  const renderRadialRing = (percent: number, colorClass: string, trackClass: string) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className={trackClass}
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClass}
        />
      </svg>
    );
  };

  const handleDownloadPNG = async () => {
    if (!graphicRef.current) return;
    try {
      setExporting(true);
      const dataUrl = await toPng(graphicRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `infographic_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export infographic PNG:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="printable-document-sheet bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header & PNG Export Button */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Cryptographically Grounded Data Visualization • 2x High-DPI Output
          </p>
        </div>

        <button
          onClick={handleDownloadPNG}
          disabled={exporting}
          className="no-print flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs w-fit cursor-pointer disabled:opacity-50"
          title="Download high-resolution graphic as PNG"
        >
          <Download className="h-4 w-4" />
          <span>{exporting ? "Generating PNG..." : "Download Graphic (PNG)"}</span>
        </button>
      </div>

      {/* Target of html-to-image capture */}
      <div ref={graphicRef} className="space-y-6 bg-white p-2 sm:p-4 rounded-xl">
        {/* Visual Metric Gauges (Radial Rings + Numbers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => {
            const pct = m.percent ?? 90;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col items-center text-center space-y-2"
              >
                <div className="relative flex items-center justify-center">
                  {renderRadialRing(
                    pct,
                    idx === 0
                      ? "text-blue-600"
                      : idx === 1
                      ? "text-emerald-600"
                      : idx === 2
                      ? "text-purple-600"
                      : "text-teal-600",
                    "text-slate-200"
                  )}
                  <span className="absolute text-sm font-black text-slate-900 font-mono">
                    {m.value}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                    {m.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5 inline-block">
                    {m.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Horizontal Comparative Data Bars */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Containment & Grounding Confidence Vectors
            </h3>
            <span className="text-[10px] font-mono text-slate-400">100-Point Scale</span>
          </div>

          <div className="space-y-3.5">
            {comparisonBars.map((bar, idx) => {
              const { text, bar: barBg } = getBarColorClasses(bar.color);
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{bar.label}</span>
                    <span className={`font-mono ${text} font-bold`}>{bar.value}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${barBg} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, bar.percent))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Milestone Progression Flow */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            24-Hour Incident Chronology & Verification Flow
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      item.status === "critical"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : item.status === "warning"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {item.time}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.event}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
