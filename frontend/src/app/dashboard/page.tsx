"use client";

import Link from "next/link";
import MetricCards from "@/components/dashboard/MetricCards";
import RecentSessionsTable from "@/components/dashboard/RecentSessionsTable";
import RecentReviewList from "@/components/dashboard/RecentReviewList";
import { PlusCircle, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-blue-950/30 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
              Internal Intelligence Platform
            </span>
            <span className="text-xs text-slate-400">SIH 2026 — SIH26154</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Operator Intelligence Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Persistent source transformation, evidence-backed verification, and artifact provenance</p>
        </div>

        <Link
          href="/sessions/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-400 transition-all shrink-0"
        >
          <PlusCircle className="h-4 w-4" /> Create Transformation Session
        </Link>
      </div>

      {/* Metrics Row */}
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
