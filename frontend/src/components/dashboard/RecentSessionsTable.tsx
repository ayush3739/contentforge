"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getStatusBadgeClass } from "@/lib/utils";
import { fetchSessions } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowRight, FileText, PlusCircle } from "lucide-react";

export default function RecentSessionsTable() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadSessions() {
      try {
        setIsLoading(true);
        const data = await fetchSessions();
        if (Array.isArray(data)) {
          setSessions(data);
        }
      } catch (err) {
        console.error("Error fetching sessions in RecentSessionsTable:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, [user]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Workspace Sessions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active content transformation pipelines for {mounted ? (user?.username || user?.user_id || "you") : "you"}</p>
        </div>
        <Link href="/sessions" className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
          View All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">Loading active sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">No active sessions found for your account.</p>
            <Link
              href="/sessions/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Create Session
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] tracking-wider">Session ID / Name</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] tracking-wider">Source Document</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] tracking-wider">CCO</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] tracking-wider">Outputs</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] tracking-wider">Status</th>
                <th className="py-2.5 px-3 text-right font-bold uppercase text-[10px] tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{s.id}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" /> {s.document || s.documents?.[0]?.name || s.name || "Document"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-blue-700 dark:text-blue-400 font-mono font-semibold">{s.cco || "v2"}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{s.transformation_count ?? s.outputs ?? 2} artifacts</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadgeClass(s.status || "active")}`}>
                      {s.status || "active"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/sessions/${s.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 font-semibold text-[11px] transition-colors inline-block"
                    >
                      Open Workspace
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
