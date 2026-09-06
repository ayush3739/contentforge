"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  ClipboardCheck,
  FileSpreadsheet,
  ShieldAlert,
  Users,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const displayName = mounted
    ? (clerkUser?.username ||
       clerkUser?.fullName ||
       clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
       "Operator")
    : "Operator";

  const isAnalyst = true;
  const isAdmin = mounted && activeRole === "admin";
  const displayRole = mounted ? activeRole : "analyst";
  const effectiveSidebarOpen = mounted ? sidebarOpen : true;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: isAnalyst },
    { label: "Sessions", href: "/sessions", icon: FolderKanban, show: isAnalyst },
    { label: "New Session", href: "/sessions/new", icon: PlusCircle, show: isAnalyst },
    { label: "Artifacts", href: "/artifacts", icon: FileSpreadsheet, show: isAnalyst },
  ];


  const adminItems = [
    { label: "User Management", href: "/admin/users", icon: Users, show: isAdmin },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText, show: isAdmin },
    { label: "Security Events", href: "/admin/security-events", icon: ShieldAlert, show: isAdmin },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 select-none shadow-xs text-slate-900 dark:text-slate-100",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header with Official Logo & Clean Typography */}
      <div className="flex h-18 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden py-1 group">
          <img
            src="/logo.png"
            alt="ContentForge AI"
            className="h-10 w-10 shrink-0 object-contain transition-transform group-hover:scale-105"
          />
          {sidebarOpen && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight leading-none">
                  ContentForge
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-black uppercase tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider mt-1 truncate">
                ENGINE SIH26154
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1">
          {sidebarOpen && (
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Workspace Menu
            </div>
          )}
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/sessions"
                  ? pathname === "/sessions" || (pathname.startsWith("/sessions/") && pathname !== "/sessions/new")
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ease-in-out group relative outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 active:scale-[0.98] select-none",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )}
                  />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 pt-4">
            {sidebarOpen && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                  Governance & Audit
                </span>
                <Lock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ease-in-out group outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 active:scale-[0.98] select-none",
                    isActive
                      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )}
                  />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Card & Logout Button */}
      <div className="p-3 m-3 mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col gap-2 text-xs shadow-xs">
        {sidebarOpen ? (
          <>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">Signed in as:</span>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                {displayRole}
              </span>
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{displayName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <ThemeToggle className="flex-1 text-xs py-1.5" />
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center justify-center p-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
