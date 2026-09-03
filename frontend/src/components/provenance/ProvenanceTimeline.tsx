"use client";

import { CheckCircle2, ShieldCheck, FileText, Cpu, Lock, Link as LinkIcon } from "lucide-react";

export default function ProvenanceTimeline() {
  const steps = [
    { title: "Source Ingestion", desc: "Incident_Report_Ransomware_Attack.pdf (SHA-256: a891f4...)", status: "Anchored", icon: FileText, color: "text-blue-400" },
    { title: "CCO v2 Verification", desc: "Extracted 4 claims, 3 identifiers with 0.98 confidence", status: "Anchored", icon: ShieldCheck, color: "text-cyan-400" },
    { title: "Transformation Execution", desc: "TR-88412 execution log recorded", status: "Anchored", icon: Cpu, color: "text-purple-400" },
    { title: "Artifact Generation", desc: "ART-001 Presentation PPTX checksum computed", status: "Anchored", icon: CheckCircle2, color: "text-emerald-400" },
    { title: "Blockchain Ledger Anchor", desc: "Permissioned Fabric Ledger Hash: 8a91f42e391b002c91847120a11c8d", status: "ANCHORED ✓", icon: Lock, color: "text-emerald-400" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" /> Provenance Audit Chain
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Non-repudiable audit lineage anchored on permissioned ledger</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
          ANCHORED ON FABRIC
        </span>
      </div>

      <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-start gap-4 relative z-10 pl-2">
              <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${step.color} shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{step.title}</span>
                  <span className="font-mono font-semibold text-emerald-400 text-[10px]">{step.status}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
