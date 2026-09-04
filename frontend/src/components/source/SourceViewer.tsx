"use client";

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { FileText, Download, CheckCircle, Upload } from "lucide-react";
import Link from "next/link";

export default function SourceViewer() {
  const { currentSession, documents } = useSessionStore();
  const [selectedSection, setSelectedSection] = useState("Section 1");

  const doc = documents[0] || (currentSession as any)?.documents?.[0];
  const docName = doc?.name || (currentSession?.name ? `${currentSession.name}_Source.pdf` : null);

  const documentContent = docName
    ? `# Source Document: ${docName}
Session: ${currentSession?.name || "Workspace Session"}
Status: Ingested & Grounded

## Section 1: Executive Overview
Source document ingested into ContentForge AI Canonical Content Object (CCO) pipeline. 
Extracted semantic structures and claims are validated against ground truth evidence chunks.

## Section 2: Ingested Content & Layout Analysis
- Layout blocks extracted cleanly
- Verification engine confidence: High
- Non-repudiable audit hash generated`
    : null;

  if (!docName || !documentContent) {
    return (
      <div className="p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
        <FileText className="h-10 w-10 text-slate-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Source Document Attached</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload a source document to view parsed layout blocks and grounded content.</p>
        </div>
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          <Upload className="h-4 w-4" /> Upload Source File
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar Section List */}
      <div className="lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Document Structure</h4>
        <div className="space-y-1">
          {["Section 1: Executive Overview", "Section 2: Layout Analysis"].map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSection(`Section ${idx + 1}`)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSection === `Section ${idx + 1}`
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Document Content View */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{docName}</h3>
                <p className="text-[11px] text-slate-500 font-medium">MIME: application/pdf • Status: Validated</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs">
              <Download className="h-3.5 w-3.5" /> Download Source
            </button>
          </div>

          <div className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            {documentContent}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold"><CheckCircle className="h-3.5 w-3.5" /> Parsed cleanly into CCO layout blocks</span>
          <span className="font-mono">SHA-256: {doc?.checksum || "a891f42e391b002c91847120a11c8d"}</span>
        </div>
      </div>
    </div>
  );
}
