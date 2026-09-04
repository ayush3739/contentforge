"use client";

import { useEffect } from "react";
import { getRoleFromEmail, useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Bell, Search, UserCheck, LogIn, Sparkles } from "lucide-react";

export default function Topbar() {
  const { activeRole, setRole } = useAuthStore();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && clerkUser?.primaryEmailAddress?.emailAddress) {
      const email = clerkUser.primaryEmailAddress.emailAddress;
      const derivedRole = getRoleFromEmail(email);
      if (activeRole !== derivedRole) {
        setRole(derivedRole);
      }
    }
  }, [isLoaded, clerkUser, activeRole, setRole]);

  const displayName =
    clerkUser?.username ||
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Operator";

  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || "operator@contentforge.ai";

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md z-20 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search sessions, CCO claims, artifacts..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Right User Control Bar */}
      <div className="flex items-center gap-4">
        {/* Role Pill - Auto-detected from Account Email */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl bg-slate-50 px-3 py-1 text-xs shadow-xs">
          <UserCheck className={`h-3.5 w-3.5 ${activeRole === "admin" ? "text-purple-600" : "text-blue-600"}`} />
          <span className="text-slate-500 font-medium hidden sm:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className={`bg-transparent font-bold focus:outline-none cursor-pointer text-xs uppercase ${
              activeRole === "admin" ? "text-purple-700" : "text-blue-700"
            }`}
          >
            <option value="analyst" className="bg-white text-slate-800">Analyst</option>
            <option value="admin" className="bg-white text-slate-800">Admin</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* Live System Health Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 font-medium">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-semibold hidden sm:inline">Backend Operational</span>
        </div>

        {/* Clerk User Avatar & Details */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-2.5">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-blue-500/20 shadow-xs",
                  },
                }}
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  {displayName} <Sparkles className="h-3 w-3 text-blue-600" />
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[140px] font-mono">{displayEmail}</span>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>

  );
}
