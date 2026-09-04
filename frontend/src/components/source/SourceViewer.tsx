"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle, Search } from "lucide-react";

export default function SourceViewer() {
  const [selectedSection, setSelectedSection] = useState("Section 1");

  const sampleSourceText = `# Incident Briefing: Ransomware Attack on Core Infrastructure
Date: August 14, 2026
Incident ID: INC-88412
Target: Payment Processing Cluster

## Section 1: Executive Overview
On August 14, 2026, unauthorized activity was observed across 14 systems in the production cluster. The threat actor exploited vulnerability CVE-2024-3094, leading to exfiltration of 450 GB of encrypted logs.
Total estimated financial impact is $2.5 million. The incident was mitigated within 24 hours by isolating affected nodes.

## Section 2: Immediate Remediation Actions
All administrators must revoke compromised credentials and apply patch KB-9912. Refer to security advisory at https://security.contentforge.ai/advisory/INC-88412.
1. Revoke active session tokens for affected service accounts.
2. Isolate network segments for payment processing nodes.
3. Validate database checksum integrity.
`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar Section List */}
      <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Document Structure</h4>
        <div className="space-y-1">
          {["Section 1: Executive Overview", "Section 2: Remediation Actions"].map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSection(`Section ${idx + 1}`)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSection === `Section ${idx + 1}`
                  ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Document Content View */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Incident_Report_Ransomware_Attack.pdf</h3>
                <p className="text-[11px] text-slate-500 font-medium">MIME: application/pdf • Size: 12.4 MB • Status: Validated</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
              <Download className="h-3.5 w-3.5" /> Download Source
            </button>
          </div>

          <div className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200">
            {sampleSourceText}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 mt-6">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold"><CheckCircle className="h-3.5 w-3.5" /> Parsed cleanly into 12 layout blocks</span>
          <span className="font-mono">SHA-256: a891f42e391b002c91847120a11c8d</span>
        </div>
      </div>
    </div>
  );
}
