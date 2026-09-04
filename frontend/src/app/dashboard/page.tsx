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
      {/* Executive Light Welcome Banner */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-blue-50/40 to-slate-50 shadow-xs overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full opacity-5 pointer-events-none flex items-center justify-end pr-6">
          <img src="/logo.png" alt="Emblem" className="h-64 w-64 object-contain" />
        </div>

        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-200 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" /> ContentForge AI Operator Portal
            </span>
            <span className="text-xs text-slate-500 font-mono">SIH 2026 — SIH26154</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{displayName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Persistent single-source document transformation workspace, evidence-grounded verifier pipeline, and non-repudiable blockchain provenance ledger.
          </p>
        </div>

        <Link
          href="/sessions/new"
          className="relative z-10 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs hover:shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Create Transformation Session
        </Link>
      </div>

      {/* Metric Cards Row */}
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
