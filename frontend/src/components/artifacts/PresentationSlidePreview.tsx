"use client";

import React, { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { SlideData } from "@/types/artifact";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Presentation,
} from "lucide-react";

export default function PresentationSlidePreview({ slides }: { slides: SlideData[] }) {
  const { selectedSlideIndex, setSelectedSlideIndex } = useSessionStore();
  const [showNotes, setShowNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!slides || slides.length === 0) {
    return <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No slides available in preview.</div>;
  }

  const currentSlide = slides[selectedSlideIndex] || slides[0];

  const prevSlide = () => {
    if (selectedSlideIndex > 0) {
      setSelectedSlideIndex(selectedSlideIndex - 1);
    }
  };

  const nextSlide = () => {
    if (selectedSlideIndex < slides.length - 1) {
      setSelectedSlideIndex(selectedSlideIndex + 1);
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-100 p-8 overflow-y-auto" : ""}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Presentation className="h-3.5 w-3.5" /> Slide Deck Preview
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Slide {selectedSlideIndex + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              showNotes ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Speaker Notes
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" /> {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slide Thumbnails List */}
        <div className="lg:col-span-1 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
            Slide Navigator ({slides.length})
          </div>
          {slides.map((s, idx) => {
            const isActive = selectedSlideIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedSlideIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? "bg-blue-50/80 border-blue-500 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className={isActive ? "text-blue-700" : "text-slate-600"}>Slide {s.slide_number}</span>
                  {s.evidence_refs && s.evidence_refs.length > 0 && (
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" /> Grounded
                    </span>
                  )}
                </div>
                <p className={`text-xs font-semibold truncate ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                  {s.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Main 16:9 Presentation Canvas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-[16/9] w-full rounded-2xl border border-slate-200 bg-white p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
                  Slide {currentSlide.slide_number} of {slides.length}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wide">
                  Verified Executive Slide
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentSlide.title}</h2>
              {currentSlide.key_message && (
                <div className="text-xs font-semibold text-blue-900 mt-3 bg-blue-50/80 p-3 rounded-xl border border-blue-100">
                  {currentSlide.key_message}
                </div>
              )}
            </div>

            {/* Slide Body Bullets */}
            <div className="space-y-2.5 my-auto py-4">
              {currentSlide.body && currentSlide.body.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>

            {/* Slide Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>ContentForge AI • Official Transformation Artifact</span>
              {currentSlide.evidence_refs && (
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 font-medium">
                  <span>Source CCO:</span>
                  {currentSlide.evidence_refs.map((ref, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
            <button
              onClick={prevSlide}
              disabled={selectedSlideIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="flex items-center gap-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    selectedSlideIndex === idx ? "w-6 bg-blue-600" : "w-2.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              disabled={selectedSlideIndex === slides.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Expandable Speaker Notes Drawer */}
          {showNotes && currentSlide.speaker_notes && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <MessageSquare className="h-3.5 w-3.5 text-amber-700" /> Speaker Delivery Notes:
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed pl-5 font-serif">
                &ldquo;{currentSlide.speaker_notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
