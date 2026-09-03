"use client";

import { useTransformationStore } from "@/store/useTransformationStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import { OutputType } from "@/types/transformation";
import { useRouter } from "next/navigation";
import { submitTransformation } from "@/lib/api";
import {
  Presentation,
  FileText,
  ShieldAlert,
  BarChart3,
  Video,
  Share2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function TransformationPlanner() {
  const router = useRouter();
  const { currentSession } = useSessionStore();
  const { selectedOutputTypes, toggleOutputType, params, setParams } = useTransformationStore();
  const { addToast } = useUIStore();

  const outputCards: { type: OutputType; title: string; desc: string; icon: any }[] = [
    { type: "presentation", title: "Slide Presentation", desc: "Executive slide deck with speaker notes & citations (PPTX)", icon: Presentation },
    { type: "executive_summary", title: "Executive Summary", desc: "Condensed decision briefing document (PDF/DOCX)", icon: FileText },
    { type: "advisory", title: "Security Advisory", desc: "Actionable technical advisory with remediation steps", icon: ShieldAlert },
    { type: "infographic", title: "Visual Infographic", desc: "Structured data visual representation & metrics", icon: BarChart3 },
    { type: "video_package", title: "Video Storyboard", desc: "Scene-by-scene narration & visual script package", icon: Video },
    { type: "social_post", title: "Social Communication", desc: "Multi-post platform summary (LinkedIn/X thread)", icon: Share2 },
  ];

  const handleSubmit = async () => {
    if (!currentSession) return;
    if (selectedOutputTypes.length === 0) {
      addToast({ type: "error", title: "Selection Required", message: "Please select at least one output type to generate." });
      return;
    }

    addToast({ type: "info", title: "Submitting Transformation", message: "Queuing multi-output AI pipeline..." });

    const payload = {
      session_id: currentSession.id,
      cco_version_id: "CCO-v2-88412",
      output_types: selectedOutputTypes,
      ...params,
    };

    const res = await submitTransformation(payload);
    addToast({ type: "success", title: "Job Enqueued", message: `Transformation ${res.transformation_id} started!` });
    router.push(`/transformations/${res.transformation_id}`);
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Output Type Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" /> 1. Select Target Output Formats
          </h3>
          <p className="text-xs text-slate-400 mt-1">Choose one or multiple communication artifacts to generate simultaneously from the CCO.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outputCards.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedOutputTypes.includes(card.type);
            return (
              <div
                key={card.type}
                onClick={() => toggleOutputType(card.type)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                  isSelected
                    ? "bg-blue-600/15 border-blue-500 text-slate-100 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {isSelected && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-blue-400" />}
                <div className={`p-3 rounded-xl w-fit mb-3 ${isSelected ? "bg-blue-600/20 text-blue-400" : "bg-slate-800/60 text-slate-400"}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">{card.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Generation Parameters Form */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">2. Configure Transformation Parameters</h3>
          <p className="text-xs text-slate-400 mt-1">Fine-tune audience tailoring, tone, and objective filters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Target Audience</label>
            <select
              value={params.audience}
              onChange={(e) => setParams({ audience: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="senior leadership">Senior Executive Leadership</option>
              <option value="technical teams">Technical Incident Responders</option>
              <option value="general public">General Public / Media</option>
              <option value="board of directors">Board of Directors</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Communication Tone</label>
            <select
              value={params.tone}
              onChange={(e) => setParams({ tone: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="formal">Formal & Authoritative</option>
              <option value="persuasive">Urgent & Persuasive</option>
              <option value="educational">Educational & Clear</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Language</label>
            <select
              value={params.language}
              onChange={(e) => setParams({ language: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Detail Level</label>
            <select
              value={params.detail_level}
              onChange={(e) => setParams({ detail_level: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="concise">Concise (High-Level Summary)</option>
              <option value="balanced">Balanced (Standard Briefing)</option>
              <option value="detailed">Detailed (Comprehensive Technical)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Communication Objective</label>
            <select
              value={params.objective}
              onChange={(e) => setParams({ objective: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="decision briefing">Decision Briefing</option>
              <option value="risk mitigation">Risk Mitigation Request</option>
              <option value="public disclosure">Public Disclosure</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Content Style</label>
            <select
              value={params.style}
              onChange={(e) => setParams({ style: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="executive">Executive Briefing Format</option>
              <option value="standard">Standard Corporate</option>
              <option value="minimalist">Minimalist / Direct</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all"
        >
          <Sparkles className="h-4 w-4" /> Execute Transformation Pipeline
        </button>
      </div>
    </div>
  );
}
