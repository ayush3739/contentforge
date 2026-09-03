"use client";

import Link from "next/link";
import { getStatusBadgeClass } from "@/lib/utils";
import { ArrowRight, FileText } from "lucide-react";

export default function RecentSessionsTable() {
  const sessions = [
    { id: "SES-INCIDENT-88412", name: "Q3 Ransomware Incident Response", document: "Incident_Report.pdf", cco: "v2", outputs: 3, status: "Verified", updated: "2h ago" },
    { id: "SES-THREAT-002", name: "APT-29 Supply Chain Threat Assessment", document: "APT29_Advisory.docx", cco: "v1", outputs: 2, status: "Review", updated: "4h ago" },
    { id: "SES-VULN-009", name: "Kernel CVE-2024-3094 Patch Briefing", document: "Patch_Notes.txt", cco: "v1", outputs: 4, status: "Processing", updated: "5h ago" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Recent Workspace Sessions</h3>
          <p className="text-xs text-slate-400">Active content transformation pipelines</p>
        </div>
        <Link href="/sessions" className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3 font-semibold">Session ID / Name</th>
              <th className="py-2.5 px-3 font-semibold">Source Document</th>
              <th className="py-2.5 px-3 font-semibold">CCO</th>
              <th className="py-2.5 px-3 font-semibold">Outputs</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-semibold text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{s.id}</div>
                </td>
                <td className="py-3 px-3 text-slate-300 flex items-center gap-1.5 mt-1">
                  <FileText className="h-3.5 w-3.5 text-blue-400" /> {s.document}
                </td>
                <td className="py-3 px-3 text-cyan-400 font-mono font-semibold">{s.cco}</td>
                <td className="py-3 px-3 text-slate-300">{s.outputs} artifacts</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBadgeClass(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/sessions/${s.id}`}
                    className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-medium text-[11px] transition-colors"
                  >
                    Open Workspace
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
