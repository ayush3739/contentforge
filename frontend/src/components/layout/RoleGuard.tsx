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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center border border-rose-500/20 bg-rose-500/5 rounded-2xl">
        <ShieldAlert className="h-12 w-12 text-rose-400 mb-4" />
        <h2 className="text-lg font-bold text-rose-300">Access Denied (403 Forbidden)</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Your active role (<span className="uppercase font-semibold text-rose-400">{activeRole}</span>) does not have authorization to view this resource.
        </p>
        <p className="text-xs text-slate-500 mt-4">Use the topbar role switcher to test Reviewer or Admin views.</p>
      </div>
    );
  }

  return <>{children}</>;
}
