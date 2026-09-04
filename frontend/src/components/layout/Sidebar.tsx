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
        "relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-30 select-none shadow-xs",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header with Official Logo & Clean Typography */}
      <div className="flex h-18 items-center justify-between px-4 border-b border-slate-200 bg-white">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden py-1 group">
          <img
            src="/logo.png"
            alt="ContentForge AI"
            className="h-10 w-10 shrink-0 object-contain transition-transform group-hover:scale-105"
          />
          {sidebarOpen && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                  ContentForge
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-wider">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 truncate">
                ENGINE SIH26154
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1">
          {sidebarOpen && (
            <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Workspace Menu
            </div>
          )}
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="space-y-1 border-t border-slate-200 pt-4">
            {sidebarOpen && (
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                  Governance & Audit
                </span>
                <Lock className="h-3 w-3 text-purple-600" />
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-purple-50 text-purple-700 border border-purple-200 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-purple-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile Card */}
      {sidebarOpen && (
        <div className="p-3 m-3 mb-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-1.5 text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-medium">Signed in as:</span>
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200 uppercase">
              {activeRole}
            </span>
          </div>
          <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{displayName}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
