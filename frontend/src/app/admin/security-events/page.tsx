"use client";

import RoleGuard from "@/components/layout/RoleGuard";
import SecurityEventTable from "@/components/admin/SecurityEventTable";

export default function AdminSecurityEventsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Admin — Cybersecurity Threat & Injection Log</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time prompt injection detection, malicious payload flags, and unauthorized access attempts</p>
        </div>

        <SecurityEventTable />
      </div>
    </RoleGuard>
  );
}
