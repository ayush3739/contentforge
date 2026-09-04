"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ReviewQueueTable() {
  const queue = [
    { id: "ART-001", session: "Q3 Incident Response Workspace", type: "presentation", version: 1, issue: "Grounding check: 1 claim pending reviewer sign-off", score: 0.94 },
    { id: "ART-002", session: "APT-29 Supply Chain Threat Assessment", type: "advisory", version: 2, issue: "Unsupported claim flagged by verifier engine", score: 0.88 },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Pending Reviewer Approval Queue</h3>
        <p className="text-xs text-slate-500 mt-0.5">Flagged generated artifacts requiring human reviewer verification</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60">
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Artifact ID</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Workspace Session</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Type</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Grounding Score</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Flagged Issue</th>
              <th className="py-3 px-3 text-right font-bold uppercase text-[10px] tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queue.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{q.id}</td>
                <td className="py-3.5 px-3 font-medium text-slate-700">{q.session}</td>
                <td className="py-3.5 px-3 font-mono text-blue-700 font-bold uppercase">{q.type}</td>
                <td className="py-3.5 px-3 font-extrabold text-emerald-700">{(q.score * 100).toFixed(0)}%</td>
                <td className="py-3.5 px-3 text-amber-800 font-medium">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {q.issue}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <Link
                    href={`/artifacts/${q.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors inline-block"
                  >
                    Review Artifact
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
