import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CCOData, DocumentItem, EvidenceChunk } from "@/types/document";
import { SessionItem } from "@/types/session";

interface SessionStoreState {
  currentSession: SessionItem | null;
  sessionsList: SessionItem[];
  documents: DocumentItem[];
  currentCCO: CCOData | null;
  evidenceChunks: EvidenceChunk[];
  activeTab: "overview" | "source" | "cco" | "evidence" | "transform" | "artifacts" | "provenance";
  selectedSlideIndex: number;
  
  setCurrentSession: (session: SessionItem | null) => void;
  setSessionsList: (sessions: SessionItem[]) => void;
  setDocuments: (docs: DocumentItem[]) => void;
  setCurrentCCO: (cco: CCOData | null) => void;
  setEvidenceChunks: (chunks: EvidenceChunk[]) => void;
  setActiveTab: (tab: SessionStoreState["activeTab"]) => void;
  setSelectedSlideIndex: (index: number) => void;
}

export const useSessionStore = create<SessionStoreState>()(
  devtools(
    (set) => ({
      currentSession: null,
      sessionsList: [],
      documents: [],
      currentCCO: null,
      evidenceChunks: [],
      activeTab: "overview",
      selectedSlideIndex: 0,

      setCurrentSession: (session) => set({ currentSession: session }),
      setSessionsList: (sessionsList) => set({ sessionsList }),
      setDocuments: (documents) => set({ documents }),
      setCurrentCCO: (currentCCO) => set({ currentCCO }),
      setEvidenceChunks: (evidenceChunks) => set({ evidenceChunks }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setSelectedSlideIndex: (selectedSlideIndex) => set({ selectedSlideIndex }),
    }),
    { name: "SessionStore" }
  )
);

