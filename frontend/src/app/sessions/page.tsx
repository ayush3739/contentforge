"use client";

import { useSessionStore } from "@/store/useSessionStore";
import Link from "next/link";
import StatusBadge from "@/components/sessions/StatusBadge";
import { PlusCircle, Search, FileText, ArrowRight, FolderKanban } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSessions } from "@/lib/api";

export default function SessionsPage() {
  const { sessionsList, setSessionsList } = useSessionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSessions();
        setSessionsList(data);
      } catch (e) {
        console.error("Failed to fetch sessions", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [setSessionsList]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Transformation Sessions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Persistent workspaces linking source documents, CCO representations, and artifacts</p>
        </div>
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> New Session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-sm">Loading sessions...</div>
        ) : sessionsList.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-sm">No sessions found. Create one to get started.</div>
        ) : sessionsList.map((s) => (
          <div
            key={s.id}
            className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-blue-200 hover:shadow-sm transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-blue-700 font-bold uppercase">{s.id}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{s.name}</h3>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 border-y border-slate-100 py-2.5">
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-600" /> {s.document_count} Document</span>
              <span>•</span>
              <span>{s.transformation_count} Output Artifacts</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Created by <strong className="text-slate-700">{s.created_by}</strong></span>
              <Link
                href={`/sessions/${s.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Open Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
