"use client";

import { SecurityEventItem } from "@/types/admin";
import { ShieldAlert } from "lucide-react";

export default function SecurityEventTable() {
  const events: SecurityEventItem[] = [
    { id: "SEC-101", event_type: "PROMPT_INJECTION_DETECTED", severity: "high", source_ip: "192.168.1.45", payload_summary: "Attempted instruction override in prompt input", created_at: "10:15:00" },
    { id: "SEC-102", event_type: "UNAUTHORIZED_ACCESS", severity: "medium", source_ip: "10.0.4.12", payload_summary: "Analyst role attempted admin endpoint POST /admin/users", created_at: "09:40:22" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" /> Security Threat & Injection Log
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Persisted cybersecurity events, prompt injections, and RBAC violations</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-sans">
              <th className="py-3 px-3 font-semibold">Timestamp</th>
              <th className="py-3 px-3 font-semibold">Event Type</th>
              <th className="py-3 px-3 font-semibold">Severity</th>
              <th className="py-3 px-3 font-semibold">Source IP</th>
              <th className="py-3 px-3 font-semibold">Payload Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-3 text-slate-400">{e.created_at}</td>
                <td className="py-3.5 px-3 font-bold text-rose-300">{e.event_type}</td>
                <td className="py-3.5 px-3 font-sans">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase">
                    {e.severity}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-slate-300">{e.source_ip}</td>
                <td className="py-3.5 px-3 text-slate-400 font-sans">{e.payload_summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
