"use client";

import { FolderKanban, Cpu, ClipboardCheck, FileSpreadsheet } from "lucide-react";

export default function MetricCards() {
  const metrics = [
    { title: "Active Sessions", count: 12, change: "+2 today", icon: FolderKanban, color: "text-blue-400", border: "border-blue-500/20" },
    { title: "In Processing", count: 2, change: "Running pipeline", icon: Cpu, color: "text-amber-400", border: "border-amber-500/20" },
    { title: "Review Queue", count: 3, change: "Pending approval", icon: ClipboardCheck, color: "text-purple-400", border: "border-purple-500/20" },
    { title: "Generated Artifacts", count: 31, change: "100% verified", icon: FileSpreadsheet, color: "text-emerald-400", border: "border-emerald-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border ${m.border} bg-slate-900/60 backdrop-blur-sm`}>
            <div>
              <p className="text-xs font-medium text-slate-400">{m.title}</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{m.count}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{m.change}</p>
            </div>
            <div className={`p-3 rounded-xl bg-slate-800/80 ${m.color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
