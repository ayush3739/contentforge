"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RecentReviewList() {
  const reviews = [
    { id: "ART-001", title: "Executive Incident Advisory #88412", type: "Advisory", issue: "Grounding check: 1 claim pending reviewer sign-off", score: "94%" },
    { id: "ART-002", title: "Board Presentation PPT (CVE-2024-3094)", type: "Presentation", issue: "Slide 2 financial figure verification required", score: "96%" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Items Pending Review</h3>
          <p className="text-xs text-slate-400">Reviewer approval queue items</p>
        </div>
        <Link href="/review" className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
          Open Queue <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">{r.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.issue}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                  <span className="font-mono text-cyan-400 font-semibold">{r.type}</span>
                  <span>•</span>
                  <span>Grounding Score: <strong className="text-emerald-400">{r.score}</strong></span>
                </div>
              </div>
            </div>

            <Link
              href={`/artifacts/${r.id}`}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shrink-0 transition-colors"
            >
              Review Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
