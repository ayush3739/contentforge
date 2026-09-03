"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ReviewQueueTable() {
  const queue = [
    { id: "ART-001", session: "Q3 Incident Response Workspace", type: "presentation", version: 1, issue: "Grounding check: 1 claim pending reviewer sign-off", score: 0.94 },
    { id: "ART-002", session: "APT-29 Supply Chain Threat Assessment", type: "advisory", version: 2, issue: "Unsupported claim flagged by verifier engine", score: 0.88 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-100">Pending Reviewer Approval Queue</h3>
        <p className="text-xs text-slate-400 mt-0.5">Flagged generated artifacts requiring human reviewer verification</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-3 font-semibold">Artifact ID</th>
              <th className="py-3 px-3 font-semibold">Workspace Session</th>
              <th className="py-3 px-3 font-semibold">Type</th>
              <th className="py-3 px-3 font-semibold">Grounding Score</th>
              <th className="py-3 px-3 font-semibold">Flagged Issue</th>
              <th className="py-3 px-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {queue.map((q) => (
              <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-slate-200">{q.id}</td>
                <td className="py-3.5 px-3 font-medium text-slate-300">{q.session}</td>
                <td className="py-3.5 px-3 font-mono text-cyan-400 font-semibold">{q.type}</td>
                <td className="py-3.5 px-3 font-bold text-emerald-400">{(q.score * 100).toFixed(0)}%</td>
                <td className="py-3.5 px-3 text-amber-400 font-medium flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {q.issue}
                </td>
                <td className="py-3.5 px-3 text-right">
                  <Link
                    href={`/artifacts/${q.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors"
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
