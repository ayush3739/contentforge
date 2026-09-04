"use client";

import { FolderKanban, Cpu, ClipboardCheck, FileSpreadsheet } from "lucide-react";

export default function MetricCards() {
  const metrics = [
    {
      title: "Active Sessions",
      count: 12,
      change: "+2 created today",
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "In Processing",
      count: 2,
      change: "AI Pipeline running",
      icon: Cpu,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      title: "Review Queue",
      count: 3,
      change: "Pending approval",
      icon: ClipboardCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      title: "Generated Artifacts",
      count: 31,
      change: "100% verified",
      icon: FileSpreadsheet,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-blue-200 hover:shadow-sm transition-all duration-200 group"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight">{m.count}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{m.change}</p>
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
