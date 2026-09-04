"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { ShieldAlert } from "lucide-react";

export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
}) {
  const { activeRole } = useAuthStore();

  if (!allowedRoles.includes(activeRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center border border-rose-200 bg-rose-50/50 rounded-2xl shadow-xs">
        <ShieldAlert className="h-12 w-12 text-rose-600 mb-4" />
        <h2 className="text-lg font-bold text-rose-900">Access Denied (403 Forbidden)</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md">
          Your active role (<span className="uppercase font-bold text-rose-700">{activeRole}</span>) does not have authorization to view this resource.
        </p>
        <p className="text-xs text-slate-500 mt-4">If you believe this is an error, contact an administrator to request elevated access.</p>
      </div>
    );
  }

  return <>{children}</>;
}
