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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" /> Non-Repudiable Audit Log Records
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Append-only log of user operations and business state changes</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60 font-sans">
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Timestamp</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Actor ID</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Action Event</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Resource</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3 text-slate-500">{l.created_at}</td>
                <td className="py-3.5 px-3 text-blue-700 font-bold">{l.user_id}</td>
                <td className="py-3.5 px-3 text-slate-900 font-bold">{l.action}</td>
                <td className="py-3.5 px-3 text-slate-600">{l.resource_type}:{l.resource_id}</td>
                <td className="py-3.5 px-3 font-sans">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> SUCCESS
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
