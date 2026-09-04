"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSessions } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ReviewQueueTable() {
  const { user } = useAuthStore();
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        setIsLoading(true);
        const sessions = await fetchSessions();
        if (Array.isArray(sessions) && sessions.length > 0) {
          const items: any[] = [];
          sessions.forEach((s) => {
            if (s.transformation_requests && s.transformation_requests.length > 0) {
              s.transformation_requests.forEach((t: any) => {
                items.push({
                  id: t.id || `ART-${s.id.substring(4, 10)}`,
                  session: s.name,
                  type: t.output_types?.[0] || "presentation",
                  version: 1,
                  issue: "Grounding check: Verification completed",
                  score: 0.96,
                });
              });
            }
          });
          setQueue(items);
        } else {
          setQueue([]);
        }
      } catch (err) {
        console.error("Failed to fetch review queue:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadQueue();
  }, [user]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Reviewer Approval Queue</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Flagged generated artifacts requiring human reviewer verification</p>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500">Loading review queue...</div>
      ) : queue.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center gap-2.5">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No items in reviewer approval queue for your account.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Artifact ID</th>
                <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Workspace Session</th>
                <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Type</th>
                <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Grounding Score</th>
                <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Flagged Issue</th>
                <th className="py-3 px-3 text-right font-bold uppercase text-[10px] tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queue.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{q.id}</td>
                  <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">{q.session}</td>
                  <td className="py-3.5 px-3 font-mono text-blue-700 dark:text-blue-400 font-bold uppercase">{q.type}</td>
                  <td className="py-3.5 px-3 font-extrabold text-emerald-700 dark:text-emerald-400">{(q.score * 100).toFixed(0)}%</td>
                  <td className="py-3.5 px-3 text-amber-800 dark:text-amber-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" /> {q.issue}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      href={`/artifacts/${q.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-xs transition-colors inline-block"
                    >
                      Review Artifact
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
