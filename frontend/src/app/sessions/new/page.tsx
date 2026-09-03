"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import { createSession, uploadDocument } from "@/lib/api";
import { Upload, FileText, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

export default function NewSessionPage() {
  const router = useRouter();
  const { setCurrentSession } = useSessionStore();
  const { addToast } = useUIStore();

  const [step, setStep] = useState(1);
  const [sessionName, setSessionName] = useState("Incident Briefing Workspace");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(25);

    // 1. Create Session
    const sess = await createSession({ name: sessionName });
    setCurrentSession(sess);
    setUploadProgress(60);

    // 2. Upload Document
    if (file) {
      await uploadDocument(sess.id, file);
    }
    setUploadProgress(100);
    setIsUploading(false);

    addToast({ type: "success", title: "Ingestion Completed", message: "Source parsed & CCO v1 generated!" });
    router.push(`/sessions/${sess.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">Create Transformation Session</h1>
        <p className="text-xs text-slate-400 mt-1">Upload source document to initiate AI ingestion, CCO extraction, and artifact planning</p>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-6 gap-2 border-b border-slate-800 pb-4 text-xs font-semibold">
        {["1. Source", "2. Ingest", "3. Configure", "4. Generate", "5. Verify", "6. Artifacts"].map((s, idx) => (
          <div key={idx} className={`text-center pb-2 border-b-2 ${idx === 0 ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500"}`}>
            {s}
          </div>
        ))}
      </div>

      {/* Wizard Form Card */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Workspace Session Name</label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g. Q3 Incident Briefing Workspace"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Drag and Drop Zone */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Upload Source File (PDF, DOCX, TXT, MD)</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 text-center bg-slate-950/60 transition-all cursor-pointer relative"
          >
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload className="h-10 w-10 text-blue-400 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-200">Drag & Drop source file here or click to browse</p>
            <p className="text-[11px] text-slate-500 mt-1">Supports PDF • DOCX • TXT • Markdown (Up to 50 MB)</p>
          </div>
        </div>

        {/* Selected File Card */}
        {file && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-500/30 bg-blue-600/10">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-xs font-bold text-slate-200">{file.name}</p>
                <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "text/plain"}</p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
        )}

        {/* Uploading Progress Indicator */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-blue-400" /> Extracting layout blocks & CCO...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-end pt-4">
          <button
            disabled={!file || isUploading}
            onClick={handleStartIngestion}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 transition-all"
          >
            Start Source Ingestion <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
