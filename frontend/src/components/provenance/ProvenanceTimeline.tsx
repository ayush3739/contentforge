"use client";

import { CheckCircle2, ShieldCheck, FileText, Cpu, Lock, Link as LinkIcon } from "lucide-react";

export default function ProvenanceTimeline() {
  const steps = [
    { title: "Source Document Ingestion", desc: "Incident_Report_Ransomware_Attack.pdf (SHA-256: a891f4...)", status: "Anchored", icon: FileText, color: "text-blue-600" },
    { title: "CCO v2 Cryptographic Verification", desc: "Extracted 4 claims, 3 identifiers with 0.98 confidence", status: "Anchored", icon: ShieldCheck, color: "text-emerald-600" },
    { title: "Transformation Execution Audit", desc: "TR-88412 execution log recorded in immutable journal", status: "Anchored", icon: Cpu, color: "text-purple-600" },
    { title: "Artifact Generation & Packaging", desc: "ART-001 Presentation PPTX checksum computed & verified", status: "Anchored", icon: CheckCircle2, color: "text-blue-600" },
    { title: "Blockchain Ledger Anchor", desc: "Permissioned Fabric Ledger Hash: 8a91f42e391b002c91847120a11c8d", status: "ANCHORED ✓", icon: Lock, color: "text-emerald-700" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" /> Provenance Audit Chain
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Non-repudiable audit lineage anchored on permissioned blockchain ledger</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
          ANCHORED ON FABRIC
        </span>
      </div>

      <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-start gap-4 relative z-10 pl-2">
              <div className={`p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs ${step.color} shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all shadow-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{step.title}</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">{step.status}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-mono">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
