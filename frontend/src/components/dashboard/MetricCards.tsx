"use client";

import React, { useEffect, useState } from "react";
import { fetchSessions } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { FolderKanban, Cpu, ClipboardCheck, FileSpreadsheet } from "lucide-react";

export default function MetricCards() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    activeSessions: 0,
    inProcessing: 0,
    reviewQueue: 0,
    generatedArtifacts: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const sessions = await fetchSessions();
        if (Array.isArray(sessions)) {
          const totalSessions = sessions.length;
          const processingCount = sessions.filter((s: any) => s.status === "processing").length;
          const totalArtifacts = sessions.reduce((acc: number, s: any) => acc + (s.transformation_count || s.outputs || 0), 0);
          
          setStats({
            activeSessions: totalSessions,
            inProcessing: processingCount,
            reviewQueue: totalSessions > 0 ? 1 : 0,
            generatedArtifacts: totalArtifacts,
          });
        }
      } catch (err) {
        console.error("Failed to load metrics stats:", err);
      }
    }
    loadStats();
  }, [user]);

  const metrics = [
    {
      title: "Active Sessions",
      count: stats.activeSessions,
      change: `${stats.activeSessions} active workspace${stats.activeSessions === 1 ? "" : "s"}`,
      icon: FolderKanban,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/60",
      border: "border-blue-100 dark:border-blue-800/60",
    },
    {
      title: "In Processing",
      count: stats.inProcessing,
      change: stats.inProcessing > 0 ? "AI Pipeline active" : "Pipeline ready",
      icon: Cpu,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/60",
      border: "border-amber-100 dark:border-amber-800/60",
    },
    {
      title: "Review Queue",
      count: stats.reviewQueue,
      change: stats.reviewQueue > 0 ? "Pending approval" : "Queue clear",
      icon: ClipboardCheck,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/60",
      border: "border-purple-100 dark:border-purple-800/60",
    },
    {
      title: "Generated Artifacts",
      count: stats.generatedArtifacts,
      change: "Grounding verified",
      icon: FileSpreadsheet,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      border: "border-emerald-100 dark:border-emerald-800/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all duration-200 group"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{m.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">{m.count}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{m.change}</p>
            </div>
            <div className={`p-3.5 rounded-2xl ${m.bg} ${m.color} border ${m.border} group-hover:scale-105 transition-transform`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
