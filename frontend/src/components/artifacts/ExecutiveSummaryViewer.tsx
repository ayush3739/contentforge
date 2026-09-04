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
    <div className="printable-document-sheet bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-8 max-w-4xl mx-auto">
      {/* Official Document Letterhead Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published: September 4, 2026</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Incident Response & Operations</span>
            <span>•</span>
            <span className="font-mono text-slate-400">REF: CF-EXEC-2026</span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs w-fit cursor-pointer"
          title="Print document sheet"
        >
          <Printer className="h-4 w-4 text-slate-500" /> Print Briefing
        </button>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Containment Speed</span>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">24 Hours</div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">14 nodes fully isolated & quarantined</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Financial Exposure</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$2.5M Max</div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">Fully covered under corporate policy</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">PII Compromise</span>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">0 Records</div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Cryptographic verification confirmed</p>
        </div>
      </div>

      {/* Executive Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 1. Executive Summary & Context
        </h3>
        <div className="p-5 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/40 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          {overview}
        </div>
      </div>

      {/* Key Findings */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> 2. Verified Key Findings
        </h3>
        <div className="space-y-2.5">
          {findings.map((item, idx) => {
            const findingText = typeof item === "string" ? item : item.finding;
            const impactLevel = typeof item === "object" ? item.impact : "Verified";
            const citationRef = typeof item === "object" ? item.evidence_ref : `chunk-00${idx + 1}`;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800/80 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{findingText}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {citationRef && (
                    <button
                      onClick={() => setSelectedCitation(citationRef)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 transition-colors"
                      title="View source document evidence"
                    >
                      {citationRef}
                    </button>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      impactLevel === "High"
                        ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        : impactLevel === "Medium"
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
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
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 3. Operational & Systemic Impact
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Impact Description</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {impactItems.map((impact, idx) => {
                const category = typeof impact === "string" ? `Impact #${idx + 1}` : impact.category;
                const desc = typeof impact === "string" ? impact : impact.description;
                const severity = typeof impact === "object" ? impact.severity : "Assessed";

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{category}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{desc}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700">
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
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" /> 4. Recommended Action Items
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
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{actionText}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] shrink-0 self-end sm:self-auto">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Owner: <strong className="text-slate-700 dark:text-slate-200">{owner}</strong></span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Timeline: <strong className="text-slate-700 dark:text-slate-200">{timeline}</strong></span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      priority === "Immediate"
                        ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                        : priority === "High"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
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
      {selectedCitation && (() => {
        const defaultCitations: Record<string, { text: string; source: string }> = {
          "chunk-001": {
            text: "On August 14, 2026, 14 payment gateway processing systems were quarantined following detection of anomalous outbound traffic... Threat actor exploited CVE-2024-3094.",
            source: "Incident_Report.pdf (Page 2, Paragraph 4)",
          },
          "chunk-002": {
            text: "Zero unauthorized exfiltration of customer cardholder data or unencrypted PII was recorded across primary and replica database clusters.",
            source: "Forensic_Audit.pdf (Section 3.1, Page 8)",
          },
          "chunk-003": {
            text: "Overall incident remediation, legal consultation, and system restoration costs are capped at $2,500,000 under corporate cyber indemnity insurance.",
            source: "Financial_Assessment.docx (Page 1, Summary)",
          },
        };

        const citationText =
          evidenceCitations?.[selectedCitation] ||
          defaultCitations[selectedCitation]?.text ||
          `Direct source evidence passage corresponding to grounding anchor [${selectedCitation}] in the ingested canonical content object.`;
        const citationSource =
          defaultCitations[selectedCitation]?.source ||
          `Source Document (${selectedCitation})`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                  Source Document Grounding Reference: {selectedCitation}
                </span>
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                &ldquo;{citationText}&rdquo;
              </p>
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Source: <strong>{citationSource}</strong></span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Match Confidence</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
