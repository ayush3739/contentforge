"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Bell, Search, UserCheck, LogIn, Sparkles } from "lucide-react";

export default function Topbar() {
  const { activeRole, setRole } = useAuthStore();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();

  const displayName =
    clerkUser?.username ||
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Operator";

  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || "operator@contentforge.ai";

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#0c121e]/90 px-6 backdrop-blur-xl z-20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* 3D Glassmorphic Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search sessions, CCO claims, artifacts..."
            className="w-full rounded-xl border border-slate-800/90 bg-slate-950/70 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all"
          />
        </div>
      </div>

      {/* Right User Control Bar */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="flex items-center gap-2 border border-slate-800/80 rounded-xl bg-slate-950/80 px-3 py-1 text-xs shadow-inner">
          <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-400 hidden sm:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer text-xs uppercase"
          >
            <option value="analyst" className="bg-slate-900 text-slate-200">Analyst</option>
            <option value="reviewer" className="bg-slate-900 text-slate-200">Reviewer</option>
            <option value="admin" className="bg-slate-900 text-slate-200">Admin</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#0c121e] animate-pulse" />
        </button>

        {/* Live System Health Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Shield className="h-3.5 w-3.5" />
          <span className="font-semibold hidden sm:inline">Backend Operational</span>
        </div>

        {/* Clerk User Avatar & Details */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800/80">
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-2.5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20",
                  },
                }}
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  {displayName} <Sparkles className="h-3 w-3 text-cyan-400" />
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px] font-mono">{displayEmail}</span>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
