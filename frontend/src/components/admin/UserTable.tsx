"use client";

import { useEffect, useState } from "react";
import { UserAccount } from "@/types/admin";
import { getRoleBadgeClass } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { Users, UserPlus } from "lucide-react";

export default function UserTable() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    const list: UserAccount[] = [
      {
        id: currentUser?.user_id || "USR-HANNDY-BRO",
        clerk_id: currentUser?.user_id || "user_2hanndy_bro",
        name: currentUser?.username || "hanndy bro",
        email: currentUser?.email || "hanndybro@gmail.com",
        role: currentUser?.role || "admin",
        status: "active",
      },
      {
        id: "USR-ANA-4410",
        clerk_id: "user_2analyst_9910",
        name: "Senior Analyst",
        email: "analyst@contentforge.ai",
        role: "analyst",
        status: "active",
      },
      {
        id: "USR-REV-8802",
        clerk_id: "user_2reviewer_4401",
        name: "Lead Reviewer",
        email: "reviewer@contentforge.ai",
        role: "reviewer",
        status: "active",
      },
      {
        id: "USR-ADM-0001",
        clerk_id: "user_2admin_0001",
        name: "System Governance Admin",
        email: "admin@contentforge.ai",
        role: "admin",
        status: "active",
      },
    ];
    setUsers(list);
  }, [currentUser]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Workspace Account Governance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Provision user accounts and verify assigned RBAC roles from Clerk metadata</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer">
          <UserPlus className="h-4 w-4" /> Provision User
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 font-sans">
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">User ID</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Name & Email</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Clerk Identifier</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Role</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">{u.id}</td>
                <td className="py-3.5 px-3.5">
                  <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                </td>
                <td className="py-3.5 px-3.5 font-mono text-slate-500 dark:text-slate-400">{u.clerk_id}</td>
                <td className="py-3.5 px-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getRoleBadgeClass(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                    {u.status}
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

