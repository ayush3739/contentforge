"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function RecentReviewList() {
  const reviews = [
    { id: "ART-001", title: "Executive Incident Advisory #88412", type: "Advisory", issue: "Grounding check: 1 claim pending reviewer sign-off", score: "94%" },
    { id: "ART-002", title: "Board Presentation PPT (CVE-2024-3094)", type: "Presentation", issue: "Slide 2 financial figure verification required", score: "96%" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Items Pending Review</h3>
          <p className="text-xs text-slate-500 mt-0.5">Reviewer approval queue items</p>
        </div>
        <Link href="/review" className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
          Open Queue <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50/40 hover:border-purple-200 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{r.issue}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                  <span className="font-mono text-blue-700 font-bold uppercase">{r.type}</span>
                  <span>•</span>
                  <span>Grounding Score: <strong className="text-emerald-700 font-bold">{r.score}</strong></span>
                </div>
              </div>
            </div>

            <Link
              href={`/artifacts/${r.id}`}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold shrink-0 transition-colors"
            >
              Review Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
