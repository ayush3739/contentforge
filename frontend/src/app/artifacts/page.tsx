"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSessions } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { FileSpreadsheet, PlusCircle, ShieldCheck, ArrowRight } from "lucide-react";

export default function ArtifactsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadArtifactsData() {
      try {
        setIsLoading(true);
        const data = await fetchSessions();
        if (Array.isArray(data)) {
          setSessions(data);
        }
      } catch (err) {
        console.error("Failed to fetch sessions for artifacts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadArtifactsData();
  }, [user]);

  // Aggregate artifacts across user's active sessions
  const userArtifacts = sessions.flatMap((s) => {
    if (s.transformation_requests && s.transformation_requests.length > 0) {
      return s.transformation_requests.map((t: any) => ({
        id: t.id || `ART-${s.id.substring(4, 10)}`,
        sessionId: s.id,
        sessionName: s.name,
        type: t.output_types?.[0] || "presentation",
        title: `${s.name} - Grounded Output`,
        status: t.status || "verified",
        created_at: t.created_at || s.created_at,
      }));
    }
    return [];
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Generated Output Artifacts</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
              {userArtifacts.length} Artifacts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-platform presentation slides, executive advisories, and grounded document outputs
          </p>
        </div>

        <Link
          href="/sessions/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Create Session
        </Link>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading generated artifacts...
        </div>
      ) : userArtifacts.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
            <FileSpreadsheet className="h-10 w-10" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Generated Artifacts Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No artifacts exist for your account yet. Create a transformation session, upload a source document, and run the verifier pipeline to generate grounded output slides and reports.
            </p>
          </div>
          <Link
            href="/sessions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all"
          >
            <PlusCircle className="h-4 w-4" /> Create Transformation Session
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userArtifacts.map((art) => (
            <div
              key={art.id}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">
                    {art.id}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="h-3 w-3" /> Grounded
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{art.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Workspace: <strong className="text-slate-700 dark:text-slate-300">{art.sessionName}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-mono">{art.type}</span>
                <Link
                  href={`/artifacts/${art.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Workspace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
