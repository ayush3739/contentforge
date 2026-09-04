"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { Search, FileText, Bookmark, ExternalLink } from "lucide-react";

export default function EvidenceViewer() {
  const { evidenceChunks, setActiveTab } = useSessionStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = evidenceChunks.filter((c) =>
    c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search evidence chunks & section citations..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total Indexed Evidence Chunks: <strong className="text-slate-900 dark:text-white">{evidenceChunks.length}</strong>
        </div>
      </div>

      {/* Chunks List */}
      <div className="space-y-4">
        {filtered.map((chunk) => (
          <div key={chunk.chunk_id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">{chunk.chunk_id}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Page {chunk.page}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-500 dark:text-slate-400">{chunk.section}</span>
              </div>
              <button
                onClick={() => setActiveTab("source")}
                className="flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:underline font-bold transition-colors cursor-pointer"
              >
                Jump to Source <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              &ldquo;{chunk.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
