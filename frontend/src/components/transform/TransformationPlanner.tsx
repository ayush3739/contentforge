"use client";
import React, { useState } from "react";
import { useTransformationStore } from "@/store/useTransformationStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import { OutputType, ArtifactTemplateConfig } from "@/types/transformation";
import { useRouter, useParams } from "next/navigation";
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
  LayoutTemplate,
  Palette,
  ShieldCheck,
  Layers,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransformationPlannerProps {
  sessionId?: string;
}

export default function TransformationPlanner({ sessionId: sessionIdProp }: TransformationPlannerProps = {}) {
  const router = useRouter();
  const routeParams = useParams();
  const { currentSession } = useSessionStore();
  const activeSessionId = sessionIdProp || currentSession?.id || (routeParams?.sessionId as string);

  const { selectedOutputTypes, toggleOutputType, params, setParams, socialConfig, setSocialConfig } =
    useTransformationStore();
  const { addToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [templateConfigs, setTemplateConfigs] = useState<Record<string, ArtifactTemplateConfig>>({
    presentation: {
      artifact_type: "presentation",
      template_id: "executive_briefing",
      brand_theme: "executive_blue",
      classification: "UNCLASSIFIED // TLP:CLEAR",
      include_evidence_refs: true,
      include_verification_footer: true,
    },
    executive_summary: {
      artifact_type: "executive_summary",
      template_id: "executive_summary",
      brand_theme: "executive_blue",
      classification: "UNCLASSIFIED // TLP:CLEAR",
      include_evidence_refs: true,
      include_verification_footer: true,
    },
    advisory: {
      artifact_type: "advisory",
      template_id: "security_advisory",
      brand_theme: "threat_dark",
      classification: "UNCLASSIFIED // TLP:CLEAR",
      include_evidence_refs: true,
      include_verification_footer: true,
    },
    infographic: {
      artifact_type: "infographic",
      template_id: "executive_snapshot",
      brand_theme: "executive_blue",
      classification: "UNCLASSIFIED // TLP:CLEAR",
      include_evidence_refs: true,
      include_verification_footer: true,
    },
  });

  const updateTemplateConfig = (type: string, updates: Partial<ArtifactTemplateConfig>) => {
    setTemplateConfigs((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || {
          artifact_type: type as OutputType,
          template_id: type === "advisory" ? "security_advisory" : type === "presentation" ? "executive_briefing" : "executive_summary",
        }),
        ...updates,
      },
    }));
  };

  const outputCards: { type: OutputType; title: string; desc: string; icon: any }[] = [
    { type: "presentation", title: "Slide Presentation", desc: "Executive slide deck with speaker notes & citations (PPTX)", icon: Presentation },
    { type: "executive_summary", title: "Executive Summary", desc: "Condensed decision briefing document (PDF/DOCX)", icon: FileText },
    { type: "advisory", title: "Security Advisory", desc: "Actionable technical advisory with remediation steps", icon: ShieldAlert },
    { type: "infographic", title: "Visual Infographic", desc: "Structured data visual representation & metrics", icon: BarChart3 },
    { type: "video_package", title: "Video Storyboard", desc: "Scene-by-scene narration & visual script package", icon: Video },
    { type: "social_post", title: "Social Communication", desc: "Multi-post platform summary (LinkedIn/X/Instagram)", icon: Share2 },
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!activeSessionId) {
      addToast({
        type: "error",
        title: "Session Missing",
        message: "No active workspace session found. Please reload or re-select the session.",
      });
      return;
    }

    if (selectedOutputTypes.length === 0) {
      addToast({
        type: "error",
        title: "Selection Required",
        message: "Please select at least one output type to generate.",
      });
      return;
    }

    setIsSubmitting(true);
    addToast({
      type: "info",
      title: "Submitting Transformation",
      message: "Queuing multi-output AI pipeline...",
    });

    try {
      const activeTplConfigs = Object.fromEntries(
        Object.entries(templateConfigs).filter(([k]) => selectedOutputTypes.includes(k as OutputType))
      );

      const payload = {
        session_id: activeSessionId,
        output_types: selectedOutputTypes,
        ...params,
        ...(selectedOutputTypes.includes("social_post") ? { social_config: socialConfig } : {}),
        template_configs: activeTplConfigs,
      };

      const res = await submitTransformation(payload);
      addToast({
        type: "success",
        title: "Job Enqueued",
        message: `Transformation ${res.transformation_id} started!`,
      });
      router.push(`/transformations/${res.transformation_id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      addToast({
        type: "error",
        title: "Submission Failed",
        message: err.message || "Failed to start transformation pipeline.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Output Type Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 1. Select Target Output Formats
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose one or multiple communication artifacts to generate simultaneously from the CCO.</p>
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
                    ? "bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {isSelected && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-blue-600 dark:text-blue-400" />}
                <div className={`p-3 rounded-xl w-fit mb-3 ${isSelected ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{card.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Conditional Social Media Configuration Drawer */}
        {selectedOutputTypes.includes("social_post") && (
          <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-600" />
                Social Communication Configuration
              </h4>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                Active For Social Artifact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Target Platform
                </label>
                <select
                  value={socialConfig.platform}
                  onChange={(e) => setSocialConfig({ platform: e.target.value as any })}
                  className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="twitter">X / Twitter Thread</option>
                  <option value="instagram">Instagram Carousel</option>
                  <option value="newsletter">Executive Newsletter</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Social Tone
                </label>
                <select
                  value={socialConfig.tone}
                  onChange={(e) => setSocialConfig({ tone: e.target.value as any })}
                  className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="thought_leadership">Thought Leadership</option>
                  <option value="punchy_viral">Punchy &amp; High Engagement</option>
                  <option value="official_pr">Official PR Announcement</option>
                  <option value="technical_breakdown">Technical Breakdown</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Target Persona
                </label>
                <select
                  value={socialConfig.persona}
                  onChange={(e) => setSocialConfig({ persona: e.target.value as any })}
                  className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="c_suite">C-Suite &amp; Executives</option>
                  <option value="developers">Developers &amp; Engineers</option>
                  <option value="general_public">General Audience / Media</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Post Structure
                </label>
                <select
                  value={socialConfig.format}
                  onChange={(e) => setSocialConfig({ format: e.target.value as any })}
                  className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single_post">Single High-Impact Post</option>
                  <option value="thread">Multi-Card / Thread Format</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Controlled Template Configuration Section (WP-5A) */}
        {selectedOutputTypes.some((t) => ["presentation", "executive_summary", "advisory", "infographic"].includes(t)) && (
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-blue-950/20 space-y-5 shadow-xs animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Controlled Template &amp; Styling Configurator
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select institutional layout standards, visual color palettes, and security classification markings.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 w-fit">
                WP-5A Controlled Specs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Presentation Template Card */}
              {selectedOutputTypes.includes("presentation") && (
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-white/80 dark:bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Presentation className="h-3.5 w-3.5 text-blue-600" />
                      Slide Deck Template (PPTX)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">16:9 Widescreen</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Layout Standard</label>
                    <select
                      value={templateConfigs.presentation?.template_id || "executive_briefing"}
                      onChange={(e) => updateTemplateConfig("presentation", { template_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="executive_briefing">Executive Strategic Briefing (KPI Cards, Strategic Highlights)</option>
                      <option value="incident_investigation">Incident Investigation Deck (Threat Dark, Timeline, IoC Matrix)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Visual Theme</label>
                      <select
                        value={templateConfigs.presentation?.brand_theme || "executive_blue"}
                        onChange={(e) => updateTemplateConfig("presentation", { brand_theme: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="executive_blue">Executive Blue</option>
                        <option value="threat_dark">Threat Dark</option>
                        <option value="modern_minimal">Modern Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Classification Banner</label>
                      <select
                        value={templateConfigs.presentation?.classification || "UNCLASSIFIED // TLP:CLEAR"}
                        onChange={(e) => updateTemplateConfig("presentation", { classification: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="UNCLASSIFIED // TLP:CLEAR">UNCLASSIFIED // TLP:CLEAR</option>
                        <option value="CONFIDENTIAL // INTERNAL USE ONLY">CONFIDENTIAL // INTERNAL</option>
                        <option value="RESTRICTED // LAW ENFORCEMENT SENSITIVE">RESTRICTED // SENSITIVE</option>
                        <option value="TOP SECRET // NOFORN">TOP SECRET // NOFORN</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Executive Summary Template Card */}
              {selectedOutputTypes.includes("executive_summary") && (
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-white/80 dark:bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      Executive Summary Template (DOCX)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Document Control</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Document Standard</label>
                    <select
                      value={templateConfigs.executive_summary?.template_id || "executive_summary"}
                      onChange={(e) => updateTemplateConfig("executive_summary", { template_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="executive_summary">Executive Decision Brief (Document Control Box, Impact Table, Actions)</option>
                      <option value="security_advisory">Technical Advisory Format (CVSS Threat Callout, Systems Grid)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Visual Theme</label>
                      <select
                        value={templateConfigs.executive_summary?.brand_theme || "executive_blue"}
                        onChange={(e) => updateTemplateConfig("executive_summary", { brand_theme: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="executive_blue">Executive Blue</option>
                        <option value="threat_dark">Threat Dark</option>
                        <option value="modern_minimal">Modern Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Classification Banner</label>
                      <select
                        value={templateConfigs.executive_summary?.classification || "UNCLASSIFIED // TLP:CLEAR"}
                        onChange={(e) => updateTemplateConfig("executive_summary", { classification: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="UNCLASSIFIED // TLP:CLEAR">UNCLASSIFIED // TLP:CLEAR</option>
                        <option value="CONFIDENTIAL // INTERNAL USE ONLY">CONFIDENTIAL // INTERNAL</option>
                        <option value="RESTRICTED // LAW ENFORCEMENT SENSITIVE">RESTRICTED // SENSITIVE</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Advisory Template Card */}
              {selectedOutputTypes.includes("advisory") && (
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-white/80 dark:bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      Security Advisory Template (DOCX)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">CVSS Threat Spec</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Advisory Standard</label>
                    <select
                      value={templateConfigs.advisory?.template_id || "security_advisory"}
                      onChange={(e) => updateTemplateConfig("advisory", { template_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="security_advisory">Technical Security Advisory (CVSS Header, Affected Systems, IoC Table)</option>
                      <option value="executive_summary">Executive Summary Format (Document Control &amp; Actions)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Visual Theme</label>
                      <select
                        value={templateConfigs.advisory?.brand_theme || "threat_dark"}
                        onChange={(e) => updateTemplateConfig("advisory", { brand_theme: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="threat_dark">Threat Dark</option>
                        <option value="executive_blue">Executive Blue</option>
                        <option value="modern_minimal">Modern Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Classification Banner</label>
                      <select
                        value={templateConfigs.advisory?.classification || "UNCLASSIFIED // TLP:CLEAR"}
                        onChange={(e) => updateTemplateConfig("advisory", { classification: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="UNCLASSIFIED // TLP:CLEAR">UNCLASSIFIED // TLP:CLEAR</option>
                        <option value="CONFIDENTIAL // INTERNAL USE ONLY">CONFIDENTIAL // INTERNAL</option>
                        <option value="RESTRICTED // LAW ENFORCEMENT SENSITIVE">RESTRICTED // SENSITIVE</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Infographic Template Card */}
              {selectedOutputTypes.includes("infographic") && (
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-white/80 dark:bg-slate-900/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                      Visual Infographic Template (SVG)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Vector SVG</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Infographic Standard</label>
                    <select
                      value={templateConfigs.infographic?.template_id || "executive_snapshot"}
                      onChange={(e) => updateTemplateConfig("infographic", { template_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="executive_snapshot">Executive Strategic Snapshot (KPI Cards, Metric Progress Bars)</option>
                      <option value="incident_brief">Incident Intelligence Snapshot (Chronology Timeline, Impact Gauges)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Visual Theme</label>
                      <select
                        value={templateConfigs.infographic?.brand_theme || "executive_blue"}
                        onChange={(e) => updateTemplateConfig("infographic", { brand_theme: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="executive_blue">Executive Blue</option>
                        <option value="threat_dark">Threat Dark</option>
                        <option value="modern_minimal">Modern Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Classification Banner</label>
                      <select
                        value={templateConfigs.infographic?.classification || "UNCLASSIFIED // TLP:CLEAR"}
                        onChange={(e) => updateTemplateConfig("infographic", { classification: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="UNCLASSIFIED // TLP:CLEAR">UNCLASSIFIED // TLP:CLEAR</option>
                        <option value="CONFIDENTIAL // INTERNAL USE ONLY">CONFIDENTIAL // INTERNAL</option>
                        <option value="RESTRICTED // LAW ENFORCEMENT SENSITIVE">RESTRICTED // SENSITIVE</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Generation Parameters Form */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">2. Configure Transformation Parameters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fine-tune audience tailoring, tone, and objective filters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Target Audience</label>
            <select
              value={params.audience}
              onChange={(e) => setParams({ audience: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="senior leadership">Senior Executive Leadership</option>
              <option value="technical teams">Technical Incident Responders</option>
              <option value="general public">General Public / Media</option>
              <option value="board of directors">Board of Directors</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Communication Tone</label>
            <select
              value={params.tone}
              onChange={(e) => setParams({ tone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="formal">Formal & Authoritative</option>
              <option value="persuasive">Urgent & Persuasive</option>
              <option value="educational">Educational & Clear</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Language</label>
            <select
              value={params.language}
              onChange={(e) => setParams({ language: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Detail Level</label>
            <select
              value={params.detail_level}
              onChange={(e) => setParams({ detail_level: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="concise">Concise (High-Level Summary)</option>
              <option value="balanced">Balanced (Standard Briefing)</option>
              <option value="detailed">Detailed (Comprehensive Technical)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Communication Objective</label>
            <select
              value={params.objective}
              onChange={(e) => setParams({ objective: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="decision briefing">Decision Briefing</option>
              <option value="risk mitigation">Risk Mitigation Request</option>
              <option value="public disclosure">Public Disclosure</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Content Style</label>
            <select
              value={params.style}
              onChange={(e) => setParams({ style: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="executive">Executive Briefing Format</option>
              <option value="standard">Standard Corporate</option>
              <option value="minimalist">Minimalist / Direct</option>
            </select>
          </div>
        </div>

        <div className="mt-6 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20">
          <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
            Custom Instructions & Focus Area <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={params.custom_instructions || ""}
            onChange={(e) => setParams({ custom_instructions: e.target.value })}
            placeholder="e.g. Write a LinkedIn post focusing on the leadership insights of this briefing, or emphasize the revenue growth metrics for Q3..."
            className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] outline-none focus:ring-2 focus:ring-blue-500/50 select-none",
            isSubmitting && "opacity-80 cursor-not-allowed pointer-events-none scale-100 shadow-none"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Executing Transformation Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-blue-200" />
              <span>Execute Transformation Pipeline</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
