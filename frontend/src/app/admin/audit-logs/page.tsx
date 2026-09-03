"use client";

import RoleGuard from "@/components/layout/RoleGuard";
import AuditLogTable from "@/components/admin/AuditLogTable";

export default function AdminAuditLogsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Admin — Non-Repudiable Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">Append-only log of system actions, transformation jobs, and reviewer approvals</p>
        </div>

        <AuditLogTable />
      </div>
    </RoleGuard>
  );
}
