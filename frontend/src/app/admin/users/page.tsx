"use client";

import RoleGuard from "@/components/layout/RoleGuard";
import UserTable from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Admin — User Provisioning & Roles</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage operator accounts, Clerk user synchronization, and RBAC permissions</p>
        </div>

        <UserTable />
      </div>
    </RoleGuard>
  );
}
