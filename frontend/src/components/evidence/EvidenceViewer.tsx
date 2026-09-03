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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search evidence chunks & section citations..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total Indexed Chunks: <strong className="text-slate-200">{evidenceChunks.length}</strong>
        </div>
      </div>

      {/* Chunks List */}
      <div className="space-y-4">
        {filtered.map((chunk) => (
          <div key={chunk.chunk_id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-cyan-400" />
                <span className="font-mono font-bold text-cyan-300">{chunk.chunk_id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-medium">Page {chunk.page}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{chunk.section}</span>
              </div>
              <button
                onClick={() => setActiveTab("source")}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Jump to Source <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              &ldquo;{chunk.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
