"use client";

import { AuditLogItem } from "@/types/admin";
import { FileText, CheckCircle2 } from "lucide-react";

export default function AuditLogTable() {
  const logs: AuditLogItem[] = [
    { id: "AUDIT-901", user_id: "USR-001", action: "ARTIFACT_APPROVED", resource_type: "artifact", resource_id: "ART-001", details_json: { reviewer: "reviewer01" }, created_at: "10:42:11" },
    { id: "AUDIT-900", user_id: "USR-001", action: "TRANSFORMATION_STARTED", resource_type: "transformation", resource_id: "TR-88412", details_json: { outputs: ["presentation"] }, created_at: "10:35:00" },
    { id: "AUDIT-899", user_id: "USR-001", action: "SESSION_CREATED", resource_type: "session", resource_id: "SES-INCIDENT-88412", details_json: {}, created_at: "10:20:15" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" /> Non-Repudiable Audit Log Records
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Append-only log of user operations and business state changes</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-sans">
              <th className="py-3 px-3 font-semibold">Timestamp</th>
              <th className="py-3 px-3 font-semibold">Actor ID</th>
              <th className="py-3 px-3 font-semibold">Action Event</th>
              <th className="py-3 px-3 font-semibold">Resource</th>
              <th className="py-3 px-3 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-3 text-slate-400">{l.created_at}</td>
                <td className="py-3.5 px-3 text-cyan-300 font-bold">{l.user_id}</td>
                <td className="py-3.5 px-3 text-slate-200 font-bold">{l.action}</td>
                <td className="py-3.5 px-3 text-slate-400">{l.resource_type}:{l.resource_id}</td>
                <td className="py-3.5 px-3 font-sans">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> SUCCESS
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
