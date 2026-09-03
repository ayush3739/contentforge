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
      <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Structure</h4>
        <div className="space-y-1">
          {["Section 1: Executive Overview", "Section 2: Remediation Actions"].map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSection(`Section ${idx + 1}`)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedSection === `Section ${idx + 1}`
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Document Content View */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Incident_Report_Ransomware_Attack.pdf</h3>
                <p className="text-[11px] text-slate-500">MIME: application/pdf • Size: 12.4 MB • Status: Validated</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
              <Download className="h-3.5 w-3.5" /> Download Source
            </button>
          </div>

          <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
            {sampleSourceText}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800 mt-6">
          <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="h-3.5 w-3.5" /> Parsed cleanly into 12 layout blocks</span>
          <span>SHA-256: a891f42e391b002c91847120a11c8d</span>
        </div>
      </div>
    </div>
  );
}
