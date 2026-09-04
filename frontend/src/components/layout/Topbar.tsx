"use client";

import { useEffect } from "react";
import { getRoleFromEmail, permissionsMap, useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Bell, Search, UserCheck, LogIn, Sparkles, LogOut } from "lucide-react";

import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const router = useRouter();
  const { activeRole, setRole, setUser, logout } = useAuthStore();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();

  const handleLogout = async () => {
    logout();
    try {
      if (clerk && clerk.signOut) {
        await clerk.signOut();
      }
    } catch (e) {
      // ignore
    }
    router.push("/login");
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      const username =
        clerkUser.username ||
        clerkUser.fullName ||
        (email ? email.split("@")[0] : "Operator");
      const derivedRole = getRoleFromEmail(email);

      const storeUser = useAuthStore.getState().user;
      if (!storeUser || storeUser.user_id !== clerkUser.id || storeUser.role !== derivedRole) {
        setUser(
          {
            user_id: clerkUser.id,
            username: username,
            email: email,
            role: derivedRole,
            permissions: permissionsMap[derivedRole] || permissionsMap.analyst,
            status: "active",
          },
          clerkUser.id
        );
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, setUser]);

  const displayName =
    clerkUser?.username ||
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Operator";

  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || "operator@contentforge.ai";

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-6 backdrop-blur-md z-20 shadow-xs transition-colors duration-300">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search sessions, CCO claims, artifacts..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Right User Control Bar */}
      <div className="flex items-center gap-4">
        {/* Role Pill - Auto-detected from Account Email */}
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 px-3 py-1 text-xs shadow-xs">
          <UserCheck className={`h-3.5 w-3.5 ${activeRole === "admin" ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"}`} />
          <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className={`bg-transparent font-bold focus:outline-none cursor-pointer text-xs uppercase ${
              activeRole === "admin" ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"
            }`}
          >
            <option value="analyst" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Analyst</option>
            <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Admin</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {/* Live System Health Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
          <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold hidden sm:inline">Backend Operational</span>
        </div>

        {/* User Avatar, Details & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
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
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  {displayName} <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] font-mono">{displayEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 ml-1 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-800 border border-transparent transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Log Out
              </button>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
