"use client";

import { useEffect, useState } from "react";
import { AuditLogItem } from "@/types/admin";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchAdminAuditLogs } from "@/lib/api";
import { FileText, CheckCircle2, ShieldCheck, Search, Filter, RefreshCw } from "lucide-react";

export default function AuditLogTable() {
  const { user } = useAuthStore();
  const currentUserId = user?.user_id || "USR-DEFAULT-001";
  const currentUserEmail = user?.email || "operator@contentforge.ai";

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminAuditLogs(100);
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const actorName = (log as any).actor_name || log.user_id || "System";
    const email = (log as any).email || log.details_json?.email || "";
    const action = log.action || "";
    const resourceId = log.resource_id || "";

    const matchesSearch =
      actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resourceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      filterAction === "ALL" ||
      action.toUpperCase() === filterAction.toUpperCase() ||
      (filterAction === "TRANSFORMATION" && action.toUpperCase().startsWith("TRANSFORMATION"));

    return matchesSearch && matchesAction;
  });

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs transition-colors duration-300">
      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" /> Non-Repudiable System Audit Trail
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System-wide append-only activity log for all user actions, document ingestions, and approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadAuditLogs}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" /> Non-Repudiable DB Trail ({logs.length})
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by user, email, event, resource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-slate-900">All Events</option>
            <option value="UPLOAD" className="bg-white dark:bg-slate-900">Document Uploads (Ingestion)</option>
            <option value="TRANSFORMATION" className="bg-white dark:bg-slate-900">Transformations (Started & Completed)</option>
            <option value="ARTIFACT_FINALIZED" className="bg-white dark:bg-slate-900">Artifact Finalized</option>
            <option value="SESSION_CREATED" className="bg-white dark:bg-slate-900">Sessions Created</option>
            <option value="LOGIN" className="bg-white dark:bg-slate-900">Login / Auth</option>
            <option value="USER_PROVISIONED" className="bg-white dark:bg-slate-900">User Provisioning</option>
            <option value="USER_ROLE_UPDATED" className="bg-white dark:bg-slate-900">Role Updates</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 font-sans">
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Timestamp</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">User (Actor)</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Action Event</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Target Resource</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-sans font-medium">
                  Loading non-repudiable audit logs from PostgreSQL...
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((l) => {
                const actorName = (l as any).actor_name || (l.details_json?.email ? l.details_json.email.split("@")[0] : null) || l.user_id || "System";
                const actorEmail = (l as any).email || l.details_json?.email || "";
                const formattedTime = l.created_at
                  ? new Date(l.created_at).toLocaleString()
                  : "Recorded";

                return (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">{formattedTime}</td>
                    <td className="py-3.5 px-3.5 font-sans">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {actorName}
                        {l.user_id === currentUserId && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            YOU
                          </span>
                        )}
                      </div>
                      {actorEmail && <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{actorEmail}</div>}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{l.resource_type}:</span>{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">{l.resource_id || "—"}</span>
                    </td>
                    <td className="py-3.5 px-3.5 font-sans">
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> RECORDED
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                  No audit log entries matching filter query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

