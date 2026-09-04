"use client";

import React from "react";
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Copy,
  Printer,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react";

interface AdvisoryViewerProps {
  content: {
    title?: string;
    severity?: string;
    summary?: string;
    affected_entities?: string[];
    observed_activity?: Array<{ timestamp?: string; description?: string }>;
    indicators_of_compromise?: Array<{ type?: string; value?: string; context?: string }>;
    recommended_actions?: string[];
    references?: string[];
  };
}

export default function AdvisoryViewer({ content }: AdvisoryViewerProps) {
  const title = content?.title || "SECURITY ADVISORY: Targeted Ransomware Exploitation (CVE-2024-3094)";
  const severity = (content?.severity || "HIGH").toUpperCase();
  const summary =
    content?.summary ||
    "An advanced persistent threat campaign targeted enterprise payment infrastructure using remote code execution vulnerabilities in unpatched software layers. Emergency mitigation and cluster isolation are required.";

  const affected = content?.affected_entities || [
    "Core Payment Processing Nodes (Cluster B-12)",
    "Payment Gateway Microservices v3.4.1",
    "PostgreSQL Read-Replicas in Region AP-South",
  ];

  const iocs = content?.indicators_of_compromise || [
    { type: "SHA-256", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", context: "Malicious payload dropper" },
    { type: "IPv4 Address", value: "198.51.100.42", context: "Command and Control (C2) endpoint" },
    { type: "Domain", value: "telemetry-sync-cdn.internal-gateway.org", context: "Staged exfiltration mirror" },
  ];

  const mitigations = content?.recommended_actions || [
    "Block outbound communication to 198.51.100.0/24 at edge firewalls.",
    "Isolate all cluster nodes running affected package versions.",
    "Apply security patch KB-9912 immediately and verify package checksums.",
    "Invalidate and rotate all service tokens and API credentials within 6 hours.",
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 max-w-5xl mx-auto">
      {/* Official Government Advisory Banner */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                severity === "CRITICAL"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : severity === "HIGH"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              Severity: {severity}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              CERT TLP: AMBER
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Grounded In Source CCO
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">Advisory ID: ADV-2026-0814 • Target: Enterprise Incident Teams</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs w-fit"
        >
          <Printer className="h-4 w-4 text-slate-500" /> Export PDF Advisory
        </button>
      </div>

      {/* Advisory Overview */}
      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800 text-xs leading-relaxed flex items-start gap-3">
        <AlertOctagon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-slate-900 block mb-1">Executive Threat Summary</strong>
          {summary}
        </div>
      </div>

      {/* Affected Entities */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-600" /> Affected Infrastructure & Entities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {affected.map((item: any, idx) => {
            const text = typeof item === "string" ? item : item?.name || item?.entity || JSON.stringify(item);
            return (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicators of Compromise (IoCs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-rose-600" /> Verified Indicators of Compromise (IoCs)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Format: STIX 2.1 Compatible</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-sans font-bold uppercase">
              <tr>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Observable Value</th>
                <th className="py-2.5 px-4">Context</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {iocs.map((ioc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-blue-700">{ioc.type}</td>
                  <td className="py-2.5 px-4 text-slate-800 select-all">{ioc.value}</td>
                  <td className="py-2.5 px-4 text-slate-500 font-sans text-xs">{ioc.context}</td>
                  <td className="py-2.5 px-4 text-right font-sans">
                    <button
                      onClick={() => copyToClipboard(ioc.value || "")}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-blue-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remediation & Mitigation Checklist */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-emerald-600" /> Mandatory Mitigation Checklist
        </h3>
        <div className="space-y-2">
          {mitigations.map((item: any, idx) => {
            const actionText = typeof item === "string" ? item : item?.action || item?.description || JSON.stringify(item);
            const priority = typeof item === "object" ? item?.priority : null;
            const owner = typeof item === "object" ? item?.owner : null;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{actionText}</p>
                </div>
                {(priority || owner) && (
                  <div className="flex items-center gap-2 text-[10px] shrink-0 self-end sm:self-auto font-mono">
                    {priority && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase">
                        {priority}
                      </span>
                    )}
                    {owner && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {owner}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
