"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { Shield, Bell, Search, UserCheck } from "lucide-react";

export default function Topbar() {
  const { user, activeRole, setRole } = useAuthStore();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0c121e]/80 px-6 backdrop-blur-md z-20">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sessions, CCO claims, artifacts..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right User Control Bar */}
      <div className="flex items-center gap-4">
        {/* Demo Role Switcher Bar */}
        <div className="flex items-center gap-2 border border-slate-800 rounded-xl bg-slate-900/80 px-3 py-1 text-xs">
          <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-400 hidden sm:inline">Role Switcher:</span>
          <select
            value={activeRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="analyst" className="bg-slate-900 text-slate-200">Analyst</option>
            <option value="reviewer" className="bg-slate-900 text-slate-200">Reviewer</option>
            <option value="admin" className="bg-slate-900 text-slate-200">Admin</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#0c121e]" />
        </button>

        {/* System Health Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          <Shield className="h-3.5 w-3.5" />
          <span className="font-semibold hidden sm:inline">Backend Operational</span>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs border border-blue-400/30">
            {user?.username?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200">{user?.username || "Analyst"}</span>
            <span className="text-[10px] text-slate-400 capitalize">{activeRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
