"use client";

import Link from "next/link";
import MetricCards from "@/components/dashboard/MetricCards";
import RecentSessionsTable from "@/components/dashboard/RecentSessionsTable";
import RecentReviewList from "@/components/dashboard/RecentReviewList";
import { PlusCircle, Sparkles, ShieldCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user: clerkUser } = useUser();

  const displayName =
    clerkUser?.username ||
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Operator";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 3D Glassmorphic Welcome Banner */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-3xl border border-slate-800/90 bg-gradient-to-r from-slate-900/90 via-blue-950/40 to-slate-900/90 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.4)] overflow-hidden group">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/25 flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3 text-cyan-400" /> ContentForge AI Operator Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">SIH 2026 — SIH26154</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{displayName}</span>!
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Persistent source transformation workspace, evidence-backed verification pipeline, and non-repudiable ledger provenance.
          </p>
        </div>

        <Link
          href="/sessions/new"
          className="relative z-10 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_15px_30px_rgba(6,182,212,0.45)] transform hover:-translate-y-0.5 transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Create Transformation Session
        </Link>
      </div>

      {/* 3D Metric Cards Row */}
      <MetricCards />

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSessionsTable />
        </div>
        <div className="lg:col-span-1">
          <RecentReviewList />
        </div>
      </div>
    </div>
  );
}
