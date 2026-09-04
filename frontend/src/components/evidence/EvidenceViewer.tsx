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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search evidence chunks & section citations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Indexed Evidence Chunks: <strong className="text-slate-900">{evidenceChunks.length}</strong>
        </div>
      </div>

      {/* Chunks List */}
      <div className="space-y-4">
        {filtered.map((chunk) => (
          <div key={chunk.chunk_id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <Bookmark className="h-4 w-4 text-blue-600" />
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{chunk.chunk_id}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold">Page {chunk.page}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{chunk.section}</span>
              </div>
              <button
                onClick={() => setActiveTab("source")}
                className="flex items-center gap-1 text-blue-700 hover:text-blue-800 font-bold transition-colors"
              >
                Jump to Source <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
              &ldquo;{chunk.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
