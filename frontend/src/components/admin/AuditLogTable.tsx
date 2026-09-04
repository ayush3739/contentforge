"use client";

import { useState } from "react";
import { AuditLogItem } from "@/types/admin";
import { useAuthStore } from "@/store/useAuthStore";
import { FileText, CheckCircle2, ShieldCheck, Search, Filter } from "lucide-react";

export default function AuditLogTable() {
  const { user } = useAuthStore();
  const currentUserId = user?.user_id || "USR-HANNDY-BRO";
  const currentUserEmail = user?.email || "hanndybro@gmail.com";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const logs: (AuditLogItem & { actor_name: string; email: string })[] = [
    {
      id: "AUDIT-109",
      user_id: currentUserId,
      actor_name: user?.username || "hanndy bro",
      email: currentUserEmail,
      action: "USER_AUTHENTICATED",
      resource_type: "auth",
      resource_id: "CLERK_SSO_SESSION",
      details_json: { ip: "192.168.1.42", method: "OAuth/Clerk" },
      created_at: "Just Now",
    },
    {
      id: "AUDIT-108",
      user_id: currentUserId,
      actor_name: user?.username || "hanndy bro",
      email: currentUserEmail,
      action: "DOCUMENT_UPLOADED",
      resource_type: "source_doc",
      resource_id: "AYUSHMAURYA_CSE_B.docx",
      details_json: { size: "24.5 KB", cco_version: "v2" },
      created_at: "5 mins ago",
    },
    {
      id: "AUDIT-107",
      user_id: "USR-REV-8802",
      actor_name: "Lead Reviewer",
      email: "reviewer@contentforge.ai",
      action: "ARTIFACT_APPROVED",
      resource_type: "transformation",
      resource_id: "TRANS-EXEC-SUMMARY-092",
      details_json: { approved_by: "reviewer@contentforge.ai" },
      created_at: "18 mins ago",
    },
    {
      id: "AUDIT-106",
      user_id: "USR-ANA-4410",
      actor_name: "Senior Analyst",
      email: "analyst@contentforge.ai",
      action: "TRANSFORMATION_STARTED",
      resource_type: "pipeline",
      resource_id: "JOB-PPT-7731",
      details_json: { outputs: ["presentation", "advisory"] },
      created_at: "42 mins ago",
    },
    {
      id: "AUDIT-105",
      user_id: "USR-ADM-0001",
      actor_name: "System Governance Bot",
      email: "admin@contentforge.ai",
      action: "ROLE_METADATA_SYNCED",
      resource_type: "security",
      resource_id: "CLERK_METADATA_ROLE",
      details_json: { updated_role: "admin" },
      created_at: "1 hour ago",
    },
    {
      id: "AUDIT-104",
      user_id: currentUserId,
      actor_name: user?.username || "hanndy bro",
      email: currentUserEmail,
      action: "CCO_EXTRACTED",
      resource_type: "cco",
      resource_id: "CCO-SES-D8027F3E",
      details_json: { claims_extracted: 14 },
      created_at: "2 hours ago",
    },
    {
      id: "AUDIT-103",
      user_id: "USR-ANA-4410",
      actor_name: "Senior Analyst",
      email: "analyst@contentforge.ai",
      action: "USER_AUTHENTICATED",
      resource_type: "auth",
      resource_id: "SESSION_KEY_0019",
      details_json: {},
      created_at: "3 hours ago",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resource_id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === "ALL" || log.action === filterAction;

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

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0">
          <ShieldCheck className="h-4 w-4" /> Admin Access: All Logs Visible
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by user, email, event..."
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
            <option value="USER_AUTHENTICATED" className="bg-white dark:bg-slate-900">Auth Events</option>
            <option value="DOCUMENT_UPLOADED" className="bg-white dark:bg-slate-900">Document Uploads</option>
            <option value="TRANSFORMATION_STARTED" className="bg-white dark:bg-slate-900">Transformations</option>
            <option value="ARTIFACT_APPROVED" className="bg-white dark:bg-slate-900">Approvals</option>
            <option value="ROLE_METADATA_SYNCED" className="bg-white dark:bg-slate-900">Security & Roles</option>
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
            {filteredLogs.length > 0 ? (
              filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{l.created_at}</td>
                  <td className="py-3.5 px-3.5 font-sans">
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {l.actor_name}
                      {l.user_id === currentUserId && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{l.email}</div>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{l.resource_type}:</span>{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{l.resource_id}</span>
                  </td>
                  <td className="py-3.5 px-3.5 font-sans">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> SUCCESS
                    </span>
                  </td>
                </tr>
              ))
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

