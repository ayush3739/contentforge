"use client";

import React from "react";
import { Video, Clock, Mic, Eye, Sparkles, ShieldCheck, Download } from "lucide-react";

interface VideoPackageViewerProps {
  content: {
    title?: string;
    total_duration?: string;
    scenes?: Array<{
      scene_number: number;
      duration_range: string;
      visual_direction: string;
      voiceover_script: string;
      on_screen_text?: string;
    }>;
  };
}

export default function VideoPackageViewer({ content }: VideoPackageViewerProps) {
  const title = content?.title || "Executive Video Storyboard: Cybersecurity Briefing";
  const scenes = content?.scenes || [
    {
      scene_number: 1,
      duration_range: "00:00 - 00:07",
      visual_direction: "High-contrast motion graphic showing world map with node quarantine alerts flashing green to amber across payment infrastructure.",
      voiceover_script: "On August 14, automated network defense telemetry detected anomalous activity across 14 payment nodes.",
      on_screen_text: "Targeted Incident Containment • 14 Nodes Isolated",
    },
    {
      scene_number: 2,
      duration_range: "00:07 - 00:15",
      visual_direction: "Animated financial risk ceiling locking in at $2.5 million with insurance coverage verification stamp.",
      voiceover_script: "Remediation protocols were triggered within 24 hours, capping total financial risk and protecting all unencrypted customer data.",
      on_screen_text: "Exposure Capped at $2.5M • 0 PII Compromised",
    },
    {
      scene_number: 3,
      duration_range: "00:15 - 00:24",
      visual_direction: "Technical flowchart showing Kernel patch KB-9912 propagating across cluster nodes with checkmarks appearing.",
      voiceover_script: "Security patch KB-9912 is now live across all environments. Operational integrity is fully restored.",
      on_screen_text: "Security Patch KB-9912 Live • Systems Restored",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 font-mono">
              Video Package Storyboard
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Grounded In CCO
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">Total Estimated Runtime: 00:24 • Target: Stakeholder Social & Web Broadcast</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs w-fit"
        >
          <Download className="h-4 w-4 text-slate-500" /> Export Script & Cues
        </button>
      </div>

      {/* Storyboard Cards */}
      <div className="space-y-6">
        {scenes.map((scene, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                  {scene.scene_number}
                </span>
                <span className="text-sm font-bold text-slate-900">Scene {scene.scene_number}</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 font-mono text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-600" /> {scene.duration_range}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Direction */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Eye className="h-4 w-4 text-purple-600" /> Visual Direction & Motion Design
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{scene.visual_direction}</p>
                {scene.on_screen_text && (
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-400 font-medium">On-Screen Overlay: </span>
                    <strong className="text-blue-700 font-mono">{scene.on_screen_text}</strong>
                  </div>
                )}
              </div>

              {/* Voiceover Teleprompter */}
              <div className="space-y-2 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Mic className="h-4 w-4 text-blue-600" /> Voiceover Narration (Spoken Script)
                </div>
                <p className="text-xs text-slate-800 leading-relaxed italic font-serif text-sm">
                  &ldquo;{scene.voiceover_script}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
