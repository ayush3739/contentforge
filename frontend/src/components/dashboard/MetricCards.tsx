"use client";

import { FolderKanban, Cpu, ClipboardCheck, FileSpreadsheet } from "lucide-react";

export default function MetricCards() {
  const metrics = [
    { title: "Active Sessions", count: 12, change: "+2 created today", icon: FolderKanban, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", shadow: "shadow-[0_10px_25px_rgba(37,99,235,0.1)]" },
    { title: "In Processing", count: 2, change: "AI Pipeline running", icon: Cpu, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", shadow: "shadow-[0_10px_25px_rgba(245,158,11,0.1)]" },
    { title: "Review Queue", count: 3, change: "Pending approval", icon: ClipboardCheck, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", shadow: "shadow-[0_10px_25px_rgba(168,85,247,0.1)]" },
    { title: "Generated Artifacts", count: 31, change: "100% verified", icon: FileSpreadsheet, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", shadow: "shadow-[0_10px_25px_rgba(16,185,129,0.1)]" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`flex items-center justify-between p-5 rounded-2xl border ${m.border} bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl ${m.shadow} transform hover:-translate-y-1 transition-all duration-300 group`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">{m.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1.5 tracking-tight">{m.count}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{m.change}</p>
            </div>
            <div className={`p-3.5 rounded-2xl ${m.bg} ${m.color} border ${m.border} group-hover:scale-110 transition-transform`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
