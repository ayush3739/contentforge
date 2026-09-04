"use client";

import React, { useState, useEffect } from "react";
import { Share2, Copy, Check, ShieldCheck, ThumbsUp, MessageSquare, Repeat, Send, Globe, Edit3, Eye } from "lucide-react";
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
    thread?: string[];
    evidence_refs?: string[];
  };
}

export default function SocialPostViewer({ content }: SocialPostViewerProps) {
  const { addToast } = useUIStore();
  const [platform, setPlatform] = useState<"linkedin" | "twitter" | "instagram" | "newsletter">("linkedin");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editable post fields
  const title = content?.title || "Executive Communications: Incident Remediation";
  const [hook, setHook] = useState(
    content?.hook || "🚨 Critical Infrastructure Security Update: Rapid Containment & System Restoration Completed."
  );
  const [body, setBody] = useState(
    content?.body ||
      "Following an unauthorized access anomaly detected across payment processing nodes, our incident response teams executed immediate isolation protocols within 24 hours. Through coordinated patch deployment and real-time heuristics, all affected services have been 100% restored with zero unencrypted customer data compromised."
  );
  const [takeaways, setTakeaways] = useState<string[]>(
    content?.key_takeaways || [
      "14 payment gateway nodes quarantined within 24 hours.",
      "Kernel patch KB-9912 deployed across 100% of production clusters.",
      "Financial remediation impact capped under corporate cyber coverage.",
      "0 unencrypted customer PII or transaction records compromised.",
    ]
  );
  const [callToAction, setCallToAction] = useState(
    content?.call_to_action || "Access the verified CERT advisory and complete forensic audit report via our transparency portal."
  );
  const [hashtags, setHashtags] = useState<string[]>(
    content?.hashtags || ["#CyberSecurity", "#IncidentResponse", "#GovTech", "#DataProtection", "#CERT"]
  );

  // Synchronize when content prop changes
  useEffect(() => {
    if (content) {
      if (content.hook) setHook(content.hook);
      if (content.body) setBody(content.body);
      if (content.key_takeaways && content.key_takeaways.length > 0) setTakeaways(content.key_takeaways);
      if (content.call_to_action) setCallToAction(content.call_to_action);
      if (content.hashtags && content.hashtags.length > 0) setHashtags(content.hashtags);
    }
  }, [content]);

  const fullPostText = `${hook}\n\n${body}\n\nKey Takeaways:\n${takeaways.map((t) => `• ${t}`).join("\n")}\n\n${callToAction}\n\n${hashtags.join(" ")}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPostText);
      setCopied(true);
      addToast({
        type: "success",
        title: "Copied to Clipboard",
        message: "Full social media post copied and ready to publish.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({
        type: "error",
        title: "Copy Failed",
        message: "Could not write to clipboard. Please check browser permissions.",
      });
    }
  };

  return (
    <div className="printable-document-sheet bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Platform Switcher & Action Bar */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setPlatform("linkedin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              platform === "linkedin"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.37 9.74V9.93H5.09v8.57h2.74Z" />
            </svg>
            LinkedIn
          </button>
          <button
            onClick={() => setPlatform("twitter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              platform === "twitter"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X / Twitter
          </button>
          <button
            onClick={() => setPlatform("instagram")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              platform === "instagram"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setPlatform("newsletter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              platform === "newsletter"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Newsletter
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`no-print flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 border ${
              isEditing
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
            {isEditing ? "Preview Mode" : "Edit Post"}
          </button>

          <button
            onClick={handleCopy}
            className="no-print flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Post Content"}
          </button>
        </div>
      </div>

      {/* Inline Editor Drawer when user clicks "Edit Post" */}
      {isEditing && (
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <Edit3 className="h-4 w-4" /> Live Content Editor
            </span>
            <span className="text-[11px] text-amber-700 font-mono">Changes apply to preview & copy instantly</span>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Opening Hook / Headline:</label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Main Body Copy:</label>
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Key Takeaways (one per line):</label>
            <textarea
              rows={4}
              value={takeaways.join("\n")}
              onChange={(e) => setTakeaways(e.target.value.split("\n").filter((l) => l.trim().length > 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Call to Action:</label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hashtags (space separated):</label>
              <input
                type="text"
                value={hashtags.join(" ")}
                onChange={(e) => setHashtags(e.target.value.split(" ").filter((h) => h.trim().length > 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* Platform Previews */}
      {platform === "linkedin" && (
        /* LinkedIn Style Card */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-2xl mx-auto">
          {/* Author Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                CF
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">ContentForge Official</span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    VERIFIED ORG
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Public Sector Cybersecurity & Operations • Just now</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">🌐 Public</span>
          </div>

          {/* Post Content — Rendered cleanly as authentic LinkedIn post copy */}
          <div className="p-5 space-y-4 text-xs text-slate-800 leading-relaxed font-sans">
            <p className="font-bold text-sm text-slate-900 leading-snug">{hook}</p>
            <p className="whitespace-pre-line text-slate-800 leading-relaxed">{body}</p>

            {/* Seamless Bullet Takeaways (No artificial boxes; clean authentic LinkedIn format) */}
            {takeaways.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {takeaways.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-800">
                    <span className="text-blue-600 font-bold shrink-0">🔹</span>
                    <span className="font-medium">{t}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="font-semibold text-slate-900 pt-1">{callToAction}</p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {hashtags.map((h, idx) => (
                <span key={idx} className="text-blue-600 hover:underline font-semibold cursor-pointer">
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Provenance Badge inside Card Footer */}
          <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Grounded in Semantic CCO
            </span>
            {content?.evidence_refs && content.evidence_refs.length > 0 && (
              <span className="font-mono text-[10px] text-slate-400">Refs: {content.evidence_refs.slice(0, 3).join(", ")}</span>
            )}
          </div>

          {/* LinkedIn Interactive Bar Simulation */}
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <ThumbsUp className="h-4 w-4" /> Like
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <MessageSquare className="h-4 w-4" /> Comment
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <Repeat className="h-4 w-4" /> Repost
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
              <Send className="h-4 w-4" /> Share
            </span>
          </div>
        </div>
      )}

      {platform === "twitter" && (
        /* X / Twitter Style Thread */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-2xl mx-auto divide-y divide-slate-100">
          {content?.thread && content.thread.length > 0 ? (
            (() => {
              const threadList = content.thread;
              return threadList.map((tweetText, idx) => (
                <div key={idx} className={`p-5 flex gap-3 ${idx % 2 === 1 ? "bg-slate-50/50" : ""}`}>
                  <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    CF
                  </div>
                  <div className="space-y-2 text-xs text-slate-800 w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">ContentForge AI</span>
                      <span className="text-slate-400 font-mono">@contentforge_ai · {idx + 1}m</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-slate-800">{tweetText}</p>
                    <div className="text-[10px] text-blue-600 font-mono font-bold">
                      {idx + 1}/{threadList.length} 🧵
                    </div>
                  </div>
                </div>
              ));
            })()
          ) : (
            <>
              {/* Tweet 1 */}
              <div className="p-5 flex gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  CF
                </div>
                <div className="space-y-2 text-xs text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">ContentForge AI</span>
                    <span className="text-slate-400 font-mono">@contentforge_ai · 1m</span>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{hook}</p>
                  <p>{body}</p>
                  <div className="text-[10px] text-blue-600 font-mono font-bold">1/2 🧵</div>
                </div>
              </div>

              {/* Tweet 2 */}
              <div className="p-5 flex gap-3 bg-slate-50/50">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  CF
                </div>
                <div className="space-y-2 text-xs text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">ContentForge AI</span>
                    <span className="text-slate-400 font-mono">@contentforge_ai · 1m</span>
                  </div>
                  <p className="font-medium text-slate-900">Key remediation highlights:</p>
                  <ul className="space-y-1 text-slate-700">
                    {takeaways.map((t, idx) => (
                      <li key={idx}>✅ {t}</li>
                    ))}
                  </ul>
                  <p className="pt-2">{callToAction} {hashtags.slice(0, 3).join(" ")}</p>
                  <div className="text-[10px] text-blue-600 font-mono font-bold">2/2 🏁</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {platform === "instagram" && (
        /* Instagram Carousel Style Card */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-md mx-auto">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-900">
                  CF
                </div>
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">contentforge.ai</span>
                <span className="text-[10px] text-slate-400">Sponsored Intelligence Update</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">•••</span>
          </div>

          {/* Visual Slide Body */}
          <div className="aspect-square bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-300">
              <span>SECURITY BULLETIN</span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full">1/3</span>
            </div>

            <div className="space-y-3">
              <div className="h-1 w-12 bg-blue-500 rounded-full" />
              <h3 className="text-lg font-bold tracking-tight text-white leading-snug">
                {hook}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed">
                {body}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-[11px] text-emerald-300 flex items-center gap-2 font-mono">
              <Check className="h-4 w-4" /> 100% Cryptographically Grounded
            </div>
          </div>

          {/* Engagement Strip */}
          <div className="p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-3">
                <span>❤️ 1,248</span>
                <span>💬 84</span>
                <span>↗️ 219</span>
              </div>
              <span>🔖 Save</span>
            </div>
            <p className="text-slate-600 text-[11px] pt-1">
              <strong className="text-slate-900">contentforge.ai</strong> {takeaways[0]} {hashtags.slice(0, 3).join(" ")}
            </p>
          </div>
        </div>
      )}

      {platform === "newsletter" && (
        /* Executive Newsletter Style */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden max-w-2xl mx-auto font-sans">
          {/* Email Envelope Meta */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1.5 font-mono">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-bold text-slate-700 w-16">Subject:</span>
              <span className="text-slate-900 font-semibold truncate">{title}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-bold text-slate-700 w-16">From:</span>
              <span>ContentForge Intelligence &lt;briefing@contentforge.ai&gt;</span>
            </div>
          </div>

          {/* Newsletter Content */}
          <div className="p-6 space-y-5 text-xs text-slate-800 leading-relaxed">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                Executive Weekly Dispatch
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{title}</h2>
            </div>

            <p className="font-semibold text-sm text-slate-900">{hook}</p>
            <p>{body}</p>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <h4 className="font-bold text-blue-900 uppercase text-[11px] tracking-wider">
                Summary of Findings & Mitigations
              </h4>
              <ul className="space-y-1.5 text-slate-700">
                {takeaways.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <button className="print-keep px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:bg-slate-800 transition-colors">
                View Grounded Audit Report &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
