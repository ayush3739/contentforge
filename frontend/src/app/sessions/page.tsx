"use client";

import { useSessionStore } from "@/store/useSessionStore";
import Link from "next/link";
import StatusBadge from "@/components/sessions/StatusBadge";
import { PlusCircle, Search, FileText, ArrowRight, FolderKanban, Calendar, User } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { fetchSessions } from "@/lib/api";

export default function SessionsPage() {
  const { sessionsList, setSessionsList } = useSessionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessionsList;
    const q = searchQuery.toLowerCase();
    return sessionsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.created_by && s.created_by.toLowerCase().includes(q))
    );
  }, [sessionsList, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Transformation Sessions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lightweight directory of workspaces. Full evidence graphs &amp; artifacts load lazily on opening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs w-48 sm:w-64 transition-all"
            />
          </div>
          <Link
            href="/sessions/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> New Session
          </Link>
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          // Skeleton Cards
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-5 w-48 bg-slate-200 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="h-8 bg-slate-50 rounded-xl border border-slate-100" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-3 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))
        ) : filteredSessions.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <FolderKanban className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery ? "No matching sessions found" : "No active sessions found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for a different keyword or session ID."
                : "Create your first transformation session to start grounding documents into CCO."}
            </p>
            {!searchQuery && (
              <div className="pt-2">
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <PlusCircle className="h-4 w-4" /> Create Workspace
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredSessions.map((s) => {
            const hasCounts = s.document_count !== undefined && s.document_count !== null;
            const formattedDate = s.created_at
              ? new Date(s.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={s.id}
                className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-blue-300 hover:shadow-sm transition-all space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] text-blue-700 font-bold uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {s.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {s.name}
                      </h3>
                      {s.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  {/* Lightweight metadata row — avoids undefined and renders cleanly */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 border-y border-slate-100 py-2.5">
                    {hasCounts ? (
                      <>
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                          {s.document_count} {s.document_count === 1 ? "Document" : "Documents"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-700 font-medium">
                          {s.transformation_count ?? 0} {s.transformation_count === 1 ? "Output" : "Outputs"}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Workspace details load on open</span>
                    )}

                    {formattedDate && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                          <Calendar className="h-3 w-3" /> {formattedDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[180px]">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{s.created_by || "Institutional User"}</span>
                  </span>
                  <Link
                    href={`/sessions/${s.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                  >
                    Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
