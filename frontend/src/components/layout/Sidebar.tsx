"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { useUser } from "@clerk/nextjs";
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
  Flame,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { activeRole } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user: clerkUser } = useUser();

  const displayName =
    clerkUser?.username ||
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Operator";

  const isAnalyst = true;
  const isReviewer = activeRole === "reviewer" || activeRole === "admin";
  const isAdmin = activeRole === "admin";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: isAnalyst },
    { label: "Sessions", href: "/sessions", icon: FolderKanban, show: isAnalyst },
    { label: "New Session", href: "/sessions/new", icon: PlusCircle, show: isAnalyst },
    { label: "Review Queue", href: "/review", icon: ClipboardCheck, show: isReviewer, badge: "3" },
    { label: "Artifacts", href: "/artifacts/ART-001", icon: FileSpreadsheet, show: isAnalyst },
  ];

  const adminItems = [
    { label: "User Management", href: "/admin/users", icon: Users, show: isAdmin },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText, show: isAdmin },
    { label: "Security Events", href: "/admin/security-events", icon: ShieldAlert, show: isAdmin },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800/80 bg-[#0c121e] transition-all duration-300 z-30 select-none shadow-[5px_0_25px_rgba(0,0,0,0.5)]",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 text-white font-bold shadow-lg shadow-cyan-500/20 shrink-0 transform hover:scale-105 transition-transform">
            <Flame className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-100 tracking-wider">CONTENTFORGE</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase font-semibold">AI ENGINE SIH26154</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1.5">
          {sidebarOpen && <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Workspace Menu</div>}
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative transform hover:-translate-y-0.5",
                    isActive
                      ? "bg-gradient-to-r from-blue-600/25 to-cyan-500/15 text-blue-300 border border-blue-500/40 font-bold shadow-[0_4px_15px_rgba(37,99,235,0.2)]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-cyan-400" : "text-slate-400")} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="space-y-1.5 border-t border-slate-800/80 pt-4">
            {sidebarOpen && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">System Security</span>
                <Lock className="h-3 w-3 text-purple-400" />
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group transform hover:-translate-y-0.5",
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold shadow-[0_4px_15px_rgba(168,85,247,0.2)]"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-purple-300" : "text-slate-400")} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 3D Glassmorphic User Profile Card */}
      {sidebarOpen && (
        <div className="p-3 m-3 rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950/90 flex flex-col gap-1.5 text-xs shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400">Signed in as:</span>
            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
              {activeRole}
            </span>
          </div>
          <div className="font-bold text-slate-100 truncate flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{displayName}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
