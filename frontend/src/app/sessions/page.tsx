"use client";

import { useSessionStore } from "@/store/useSessionStore";
import Link from "next/link";
import StatusBadge from "@/components/sessions/StatusBadge";
import { PlusCircle, Search, FileText, ArrowRight } from "lucide-react";

export default function SessionsPage() {
  const { sessionsList } = useSessionStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Transformation Sessions</h1>
          <p className="text-xs text-slate-400 mt-0.5">Persistent workspaces linking source documents, CCO representations, and artifacts</p>
        </div>
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> New Session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessionsList.map((s) => (
          <div key={s.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-cyan-400 font-semibold">{s.id}</span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">{s.name}</h3>
              </div>
              <StatusBadge status={s.status} />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-800/60 py-2.5">
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-400" /> {s.document_count} Document</span>
              <span>•</span>
              <span>{s.transformation_count} Output Artifacts</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Created by <strong className="text-slate-300">{s.created_by}</strong></span>
              <Link
                href={`/sessions/${s.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
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
