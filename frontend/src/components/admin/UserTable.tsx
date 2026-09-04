"use client";

import { useState } from "react";
import { UserAccount } from "@/types/admin";
import { getRoleBadgeClass } from "@/lib/utils";
import { Users, UserPlus } from "lucide-react";

export default function UserTable() {
  const [users, setUsers] = useState<UserAccount[]>([
    { id: "USR-001", clerk_id: "user_2analyst_001", name: "Anand Kumar", email: "analyst01@contentforge.ai", role: "analyst", status: "active" },
    { id: "USR-002", clerk_id: "user_2reviewer_001", name: "Rajesh Singh", email: "reviewer01@contentforge.ai", role: "reviewer", status: "active" },
    { id: "USR-003", clerk_id: "user_2admin_001", name: "System Admin", email: "admin01@contentforge.ai", role: "admin", status: "active" },
  ]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" /> User Account Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Provision user accounts and assign RBAC roles</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all">
          <UserPlus className="h-4 w-4" /> Provision User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60">
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">User ID</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Name & Email</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Clerk ID</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Role</th>
              <th className="py-3 px-3 font-bold uppercase text-[10px] tracking-wider">Status</th>
              <th className="py-3 px-3 text-right font-bold uppercase text-[10px] tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{u.id}</td>
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-500">{u.clerk_id}</td>
                <td className="py-3.5 px-3">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getRoleBadgeClass(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    {u.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button className="px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors">
                    Edit Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
