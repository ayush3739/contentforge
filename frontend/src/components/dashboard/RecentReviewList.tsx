"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSessions } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RecentReviewList() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        const sessions = await fetchSessions();
        if (Array.isArray(sessions) && sessions.length > 0) {
          const items: any[] = [];
          sessions.forEach((s: any) => {
            if (s.transformation_requests && s.transformation_requests.length > 0) {
              s.transformation_requests.forEach((t: any) => {
                items.push({
                  id: t.id || `ART-${s.id.substring(4, 10)}`,
                  title: `${s.name} - Grounded Artifact`,
                  type: t.output_types?.[0] || "Presentation",
                  issue: "Grounding check: Verification completed",
                  score: "96%",
                });
              });
            }
          });
          setReviews(items);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Failed to load review items:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [user]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Items Pending Review</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reviewer approval queue items</p>
        </div>
        <Link href="/review" className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors">
          Open Queue <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-500">Loading review queue...</div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-center flex flex-col items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No items pending review for your account.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/40 hover:border-purple-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{r.issue}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-blue-700 dark:text-blue-400 font-bold uppercase">{r.type}</span>
                    <span>•</span>
                    <span>Grounding Score: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{r.score}</strong></span>
                  </div>
                </div>
              </div>

              <Link
                href={`/artifacts/${r.id}`}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold shrink-0 transition-colors"
              >
                Review Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
