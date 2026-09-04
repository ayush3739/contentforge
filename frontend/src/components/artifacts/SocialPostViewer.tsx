"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, ShieldCheck, ThumbsUp, MessageSquare, Repeat, Send, Globe } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

interface SocialPostViewerProps {
  content: {
    title?: string;
    platform?: string;
    target_audience?: string;
    hook?: string;
    body?: string;
    key_takeaways?: string[];
    call_to_action?: string;
    hashtags?: string[];
    evidence_refs?: string[];
  };
}

export default function SocialPostViewer({ content }: SocialPostViewerProps) {
  const { addToast } = useUIStore();
  const [platform, setPlatform] = useState<"linkedin" | "twitter">("linkedin");
  const [copied, setCopied] = useState(false);

  const title = content?.title || "Executive Communications: Incident Remediation";
  const hook = content?.hook || "🚨 Critical Infrastructure Security Update: Rapid Containment & System Restoration Completed.";
  const body =
    content?.body ||
    "Following an unauthorized access anomaly detected across payment processing nodes, our incident response teams executed immediate isolation protocols within 24 hours. Through coordinated patch deployment and real-time heuristics, all affected services have been 100% restored with zero unencrypted customer data compromised.";
  
  const takeaways = content?.key_takeaways || [
    "14 payment gateway nodes quarantined within 24 hours.",
    "Kernel patch KB-9912 deployed across 100% of production clusters.",
    "Financial remediation impact capped under corporate cyber coverage.",
    "0 unencrypted customer PII or transaction records compromised.",
  ];

  const callToAction = content?.call_to_action || "Access the verified CERT advisory and complete forensic audit report via our transparency portal.";
  const hashtags = content?.hashtags || ["#CyberSecurity", "#IncidentResponse", "#GovTech", "#DataProtection", "#CERT"];

  const fullPostText = `${hook}\n\n${body}\n\nKey Takeaways:\n${takeaways.map((t) => `• ${t}`).join("\n")}\n\n${callToAction}\n\n${hashtags.join(" ")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPostText);
    setCopied(true);
    addToast({
      type: "success",
      title: "Copied to Clipboard",
      message: "Full social media post copied and ready to publish.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              Social Communication Package
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> CCO Grounded
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Audience: {content?.target_audience || "Industry Partners & Public Stakeholders"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setPlatform("linkedin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                platform === "linkedin"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.93H5.09v8.57h2.74Z" />
              </svg>
              LinkedIn
            </button>
            <button
              onClick={() => setPlatform("twitter")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                platform === "twitter"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Twitter
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Post"}
          </button>
        </div>
      </div>

      {/* Social Post Preview Simulator */}
      {platform === "linkedin" ? (
        /* LinkedIn Style Card */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden max-w-2xl mx-auto">
          {/* Author Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="ContentForge AI" className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 p-1" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">ContentForge Official</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-100 dark:border-blue-800">
                    VERIFIED ORG
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Public Sector Cybersecurity & Incident Operations • Just now</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">🌐 Public</span>
          </div>

          {/* Post Content */}
          <div className="p-5 space-y-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            <p className="font-bold text-sm text-slate-900 dark:text-white">{hook}</p>
            <p className="whitespace-pre-line">{body}</p>

            {/* Key Takeaways Highlight Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
                Verified Key Findings
              </span>
              <ul className="space-y-1.5">
                {takeaways.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="font-semibold text-slate-900 dark:text-slate-100">{callToAction}</p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {hashtags.map((h, idx) => (
                <span key={idx} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* LinkedIn Interactive Bar Simulation */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
              <ThumbsUp className="h-4 w-4" /> Like
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
              <MessageSquare className="h-4 w-4" /> Comment
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
              <Repeat className="h-4 w-4" /> Repost
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
              <Send className="h-4 w-4" /> Share
            </span>
          </div>
        </div>
      ) : (
        /* X / Twitter Style Thread */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden max-w-2xl mx-auto divide-y divide-slate-100 dark:divide-slate-800">
          {/* Tweet 1 */}
          <div className="p-5 flex gap-3">
            <img src="/logo.png" alt="ContentForge AI" className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 p-1 shrink-0" />
            <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white">ContentForge AI</span>
                <span className="text-slate-400 dark:text-slate-500 font-mono">@contentforge_ai · 1m</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{hook}</p>
              <p>{body}</p>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">1/2 🧵</div>
            </div>
          </div>

          {/* Tweet 2 */}
          <div className="p-5 flex gap-3 bg-slate-50/50 dark:bg-slate-800/40">
            <img src="/logo.png" alt="ContentForge AI" className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 p-1 shrink-0" />
            <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white">ContentForge AI</span>
                <span className="text-slate-400 dark:text-slate-500 font-mono">@contentforge_ai · 1m</span>
              </div>
              <p className="font-medium">Remediation milestones:</p>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                {takeaways.map((t, idx) => (
                  <li key={idx}>✅ {t}</li>
                ))}
              </ul>
              <p className="pt-2">{callToAction} {hashtags.slice(0, 3).join(" ")}</p>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">2/2 🏁</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
