"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { SlideData } from "@/types/artifact";
import { ChevronLeft, ChevronRight, MessageSquare, Link as LinkIcon } from "lucide-react";

export default function PresentationSlidePreview({ slides }: { slides: SlideData[] }) {
  const { selectedSlideIndex, setSelectedSlideIndex, setActiveTab } = useSessionStore();

  if (!slides || slides.length === 0) {
    return <div className="p-8 text-center text-slate-400">No slides available in preview.</div>;
  }

  const currentSlide = slides[selectedSlideIndex] || slides[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Slide Thumbnails List */}
      <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slides ({slides.length})</h4>
        <div className="space-y-2">
          {slides.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSlideIndex(idx)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedSlideIndex === idx
                  ? "bg-blue-600/20 border-blue-500 text-slate-100 shadow-md"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span>Slide {s.slide_number}</span>
                {s.evidence_refs && s.evidence_refs.length > 0 && (
                  <span className="text-[10px] text-cyan-400 font-mono">Verified</span>
                )}
              </div>
              <p className="text-xs font-medium truncate text-slate-200">{s.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="lg:col-span-3 space-y-4">
        <div className="aspect-[16/9] w-full rounded-2xl border border-slate-700 bg-slate-950 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Slide Header */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono font-semibold text-cyan-400 uppercase">Slide {currentSlide.slide_number} of {slides.length}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">Rendered PPTX Preview</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{currentSlide.title}</h2>
            <p className="text-xs font-semibold text-cyan-300 mt-2 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
              {currentSlide.key_message}
            </p>
          </div>

          {/* Slide Body Bullets */}
          <ul className="space-y-2.5 my-4">
            {currentSlide.body.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Slide Footer Navigator Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <button
              disabled={selectedSlideIndex === 0}
              onClick={() => setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1))}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-slate-500 text-[11px]">Slide {selectedSlideIndex + 1} / {slides.length}</span>
            <button
              disabled={selectedSlideIndex === slides.length - 1}
              onClick={() => setSelectedSlideIndex(Math.min(slides.length - 1, selectedSlideIndex + 1))}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Speaker Notes & Evidence References */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <MessageSquare className="h-3.5 w-3.5 text-amber-400" /> Speaker Notes
            </h4>
            <p className="text-xs text-slate-300 italic">{currentSlide.speaker_notes || "No speaker notes."}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <LinkIcon className="h-3.5 w-3.5 text-cyan-400" /> Evidence Citations
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentSlide.evidence_refs?.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab("evidence")}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-semibold hover:bg-cyan-500/20 transition-colors"
                >
                  {ref}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
