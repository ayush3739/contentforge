"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import { createSession, uploadDocument } from "@/lib/api";
import { Upload, FileText, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function NewSessionPage() {
  const router = useRouter();
  const { setCurrentSession, addSession } = useSessionStore();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(1);
  const [sessionName, setSessionName] = useState("Incident Briefing Workspace");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  // Map backend SSE stage keys → user-friendly labels
  const STAGE_LABELS: Record<string, string> = {
    fetching: "Retrieving document from storage...",
    parsing: "Parsing document structure & layout blocks...",
    deterministic_extraction: "Extracting entities, metrics & rules...",
    semantic_extraction: "Running semantic AI extraction...",
    cco_build: "Building Canonical Content Object (CCO v1)...",
    chunking: "Generating pgvector embeddings...",
    persisting: "Saving to database...",
    complete: "Ingestion complete ✓",
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartIngestion = async () => {
    setIsUploading(true);
    setUploadProgress(5);
    setUploadStage("Creating session workspace...");

    // 1. Create Session
    const sess = await createSession({ name: sessionName });
    setCurrentSession(sess);
    addSession(sess);
    setUploadProgress(10);

    // 2. Upload Document with SSE streaming progress
    if (file) {
      await uploadDocument(sess.id, file, (progress, message, stage) => {
        setUploadProgress(10 + Math.floor(progress * 0.88)); // Scale 0–100 → 10–98%
        setUploadStage((stage && STAGE_LABELS[stage]) || message || "Processing...");
      });
    }
    setUploadProgress(100);
    setUploadStage("Ingestion complete ✓");
    setIsUploading(false);

    addToast({ type: "success", title: "Source Document Ingested", message: "Grounded into CCO v1. Now select which artifacts to generate!" });
    router.push(`/sessions/${sess.id}?tab=transform`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Create Transformation Session</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload source document to initiate AI ingestion, CCO extraction, and artifact planning</p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-6 gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 text-xs font-semibold">
        {["1. Source", "2. Ingest", "3. Configure", "4. Generate", "5. Verify", "6. Artifacts"].map((s, idx) => (
          <div key={idx} className={`text-center pb-2 border-b-2 ${idx === 0 ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-slate-400 dark:text-slate-500"}`}>
            {s}
          </div>
        ))}
      </div>

      {/* Wizard Form Card */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Workspace Session Name</label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g. Q3 Incident Briefing Workspace"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none shadow-2xs transition-all"
          />
        </div>

        {/* Drag and Drop Zone */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">Upload Source File (PDF, DOCX, TXT, MD)</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/30 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/40 transition-all cursor-pointer relative"
          >
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-800 dark:text-white">Drag & Drop source file here or click to browse</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Supports PDF • DOCX • TXT • Markdown (Up to 50 MB)</p>
          </div>
        </div>

        {/* Selected File Card */}
        {file && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/60 shadow-2xs">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "text/plain"}</p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}

        {/* Uploading Progress Indicator */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Ingesting document...</span>
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-1 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            {uploadStage && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {uploadStage}
              </p>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            disabled={!file || isUploading}
            onClick={handleStartIngestion}
            className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:scale-100 disabled:shadow-none select-none"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Ingesting Source File...</span>
              </>
            ) : (
              <>
                <span>Start Source Ingestion</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
