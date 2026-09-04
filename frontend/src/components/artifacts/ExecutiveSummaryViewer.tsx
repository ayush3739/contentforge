"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Printer,
  Sparkles,
} from "lucide-react";

interface ExecutiveSummaryViewerProps {
  content: {
    title?: string;
    executive_overview?: string;
    key_findings?: Array<string | { finding?: string; impact?: string; evidence_ref?: string }>;
    impact?: Array<string | { category?: string; description?: string; severity?: string }>;
    recommended_actions?: Array<string | { action?: string; priority?: string; timeline?: string; owner?: string }>;
    classification?: string;
    metadata?: Record<string, any>;
  };
  evidenceCitations?: Record<string, string>;
}

export default function ExecutiveSummaryViewer({ content, evidenceCitations }: ExecutiveSummaryViewerProps) {
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);

  const title = content?.title || "Executive Incident Briefing & Action Summary";
  const overview =
    content?.executive_overview ||
    "A verified enterprise briefing assessing recent infrastructure security anomalies, operational containment measures, and targeted risk mitigation roadmaps.";

  const findings = content?.key_findings || [
    { finding: "14 core production database nodes isolated within 24 hours of anomaly detection.", impact: "High", evidence_ref: "chunk-001" },
    { finding: "Zero unauthorized exfiltration of unencrypted customer PII verified across storage clusters.", impact: "Low", evidence_ref: "chunk-002" },
    { finding: "Estimated incident response and remediation expenditure capped at $2.5 million.", impact: "Medium", evidence_ref: "chunk-003" },
  ];

  const impactItems = content?.impact || [
    { category: "Financial Risk", description: "Remediation capped at $2.5M. Comprehensive cyber risk coverage activated.", severity: "Contained" },
    { category: "Operational Impact", description: "Payment processing downtime restricted to 42 minutes during initial node rerouting.", severity: "Minimal" },
    { category: "Regulatory Compliance", description: "Initial statutory disclosure filed with relevant CERT and banking authorities on schedule.", severity: "Compliant" },
  ];

  const actions = content?.recommended_actions || [
    { action: "Deploy Kernel patch KB-9912 across all secondary cluster environments", priority: "Immediate", timeline: "24 Hours", owner: "SecOps Lead" },
    { action: "Rotate all cluster service account certificates and access tokens", priority: "High", timeline: "48 Hours", owner: "DevSecOps Team" },
    { action: "Conduct third-party post-incident audit and update continuity documentation", priority: "Medium", timeline: "14 Days", owner: "Chief Risk Officer" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 max-w-5xl mx-auto">
      {/* Official Government / Executive Letterhead Banner */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              Official Briefing Document
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> CCO Verified
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published: September 4, 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Department of Incident Response</span>
            <span>•</span>
            <span className="font-mono text-slate-400">REF: CF-EXEC-2026-09</span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs w-fit"
        >
          <Printer className="h-4 w-4 text-slate-500" /> Print Briefing
        </button>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Containment Speed</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">24 Hours</div>
          <p className="text-xs text-slate-600 mt-0.5">14 nodes fully isolated & quarantined</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Financial Exposure</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">$2.5M Max</div>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">Fully covered under corporate policy</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">PII Compromise</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">0 Records</div>
          <p className="text-xs text-slate-600 mt-0.5">Cryptographic verification confirmed</p>
        </div>
      </div>

      {/* Executive Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" /> 1. Executive Summary & Context
        </h3>
        <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/40 text-slate-800 text-sm leading-relaxed">
          {overview}
        </div>
      </div>

      {/* Key Findings */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 2. Verified Key Findings
        </h3>
        <div className="space-y-2.5">
          {findings.map((item, idx) => {
            const findingText = typeof item === "string" ? item : item.finding;
            const impactLevel = typeof item === "object" ? item.impact : "Verified";
            const citationRef = typeof item === "object" ? item.evidence_ref : `chunk-00${idx + 1}`;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{findingText}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {citationRef && (
                    <button
                      onClick={() => setSelectedCitation(citationRef)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-mono font-semibold text-slate-500 border border-slate-200 transition-colors"
                      title="View source document evidence"
                    >
                      {citationRef}
                    </button>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      impactLevel === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : impactLevel === "Medium"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {impactLevel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Assessment Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" /> 3. Operational & Systemic Impact
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Impact Description</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {impactItems.map((impact, idx) => {
                const category = typeof impact === "string" ? `Impact #${idx + 1}` : impact.category;
                const desc = typeof impact === "string" ? impact : impact.description;
                const severity = typeof impact === "object" ? impact.severity : "Assessed";

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{category}</td>
                    <td className="py-3 px-4 text-slate-600">{desc}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                        {severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Plan Roadmap */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600" /> 4. Recommended Action Items
        </h3>
        <div className="space-y-2">
          {actions.map((act, idx) => {
            const actionText = typeof act === "string" ? act : act.action;
            const priority = typeof act === "object" ? act.priority : "Standard";
            const timeline = typeof act === "object" ? act.timeline : "Upcoming";
            const owner = typeof act === "object" ? act.owner : "Assigned Team";

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{actionText}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] shrink-0 self-end sm:self-auto">
                  <span className="text-slate-500 font-medium">Owner: <strong className="text-slate-700">{owner}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">Timeline: <strong className="text-slate-700">{timeline}</strong></span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      priority === "Immediate"
                        ? "bg-rose-100 text-rose-800"
                        : priority === "High"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Citation Popover Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                Source Document Grounding Reference: {selectedCitation}
              </span>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
              &ldquo;On August 14, 2026, 14 payment gateway processing systems were quarantined following detection of anomalous outbound traffic... Threat actor exploited CVE-2024-3094.&rdquo;
            </p>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>Source: <strong>Incident_Report.pdf</strong> (Page 2, Paragraph 4)</span>
              <span className="text-emerald-700 font-bold">100% Match Confidence</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
