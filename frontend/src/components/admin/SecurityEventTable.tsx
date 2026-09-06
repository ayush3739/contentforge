"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { ShieldAlert, RefreshCw, CheckCircle } from "lucide-react";

export default function SecurityEventTable() {
  const {
    securityEventsList: events,
    isSecurityEventsLoading,
    hasLoadedSecurityEvents,
    fetchSecurityEventsList,
  } = useAdminStore();

  useEffect(() => {
    fetchSecurityEventsList();
  }, [fetchSecurityEventsList]);

  const isLoading = !hasLoadedSecurityEvents && isSecurityEventsLoading;

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800";
      case "high":
        return "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800";
      case "medium":
        return "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" /> Security Threat & Prompt Injection Log
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
              {events.length} Incident Records
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Persisted cybersecurity events, prompt injection detections, and guardrail enforcement records</p>
        </div>
        <button
          onClick={() => fetchSecurityEventsList(true)}
          disabled={isLoading}
          className="p-2 self-start sm:self-auto rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title="Refresh Security Events"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 font-sans">
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Timestamp</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Event Type</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Severity</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Source IP</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Payload Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-sans font-medium">
                  Loading real-time security events from database...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-sans font-medium">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <span>No security threats or injection attempts currently detected. Sentinel guardrails nominal.</span>
                  </div>
                </td>
              </tr>
            ) : (
              events.map((e) => {
                const formattedTime = e.created_at
                  ? new Date(e.created_at).toLocaleString()
                  : "Recorded";

                return (
                  <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">{formattedTime}</td>
                    <td className="py-3.5 px-3.5 font-bold text-rose-700 dark:text-rose-400">{e.event_type}</td>
                    <td className="py-3.5 px-3.5 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getSeverityBadge(e.severity)}`}>
                        {e.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-700 dark:text-slate-300">{e.source_ip || "internal"}</td>
                    <td className="py-3.5 px-3.5 text-slate-600 dark:text-slate-300 font-sans">{e.payload_summary}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

