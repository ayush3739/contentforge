"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import ArtifactViewer from "@/components/artifacts/ArtifactViewer";
import VerificationPanel from "@/components/verification/VerificationPanel";
import { fetchArtifact } from "@/lib/api";
import { ArtifactItem } from "@/types/artifact";
import { Loader2, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

export default function ArtifactWorkspacePage({
  params,
}: {
  params: Promise<{ artifactId: string }>;
}) {
  const { artifactId } = use(params);
  const [artifact, setArtifact] = useState<ArtifactItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchArtifact(artifactId);
        setArtifact(data);
      } catch (err: any) {
        console.error("Failed to load artifact:", err);
        setError(err.message || "Artifact not found");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [artifactId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-48 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-bold text-slate-700">Loading artifact data from engine...</p>
        </div>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Artifact Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {error || `Unable to locate artifact ${artifactId}. It may have expired or been removed.`}
        </p>
        <div className="pt-2">
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 font-bold uppercase">
              {artifactId}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Grounded &amp; Verified
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Artifact Workspace &amp; Grounding Verification</h1>
        </div>
        <Link
          href="/sessions"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-semibold shadow-2xs transition-all shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Workspaces
        </Link>
      </div>

      <ArtifactViewer artifact={artifact} />
      {artifact.verification && <VerificationPanel report={artifact.verification} />}
    </div>
  );
}
