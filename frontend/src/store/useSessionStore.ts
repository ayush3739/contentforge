import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CCOData, DocumentItem, EvidenceChunk } from "@/types/document";
import { SessionItem } from "@/types/session";
import { fetchSessions } from "@/lib/api";

interface SessionStoreState {
  currentSession: SessionItem | null;
  sessionsList: SessionItem[];
  hasLoadedSessions: boolean;
  isSessionsLoading: boolean;
  documents: DocumentItem[];
  currentCCO: CCOData | null;
  evidenceChunks: EvidenceChunk[];
  activeTab: "overview" | "source" | "cco" | "evidence" | "transform" | "artifacts" | "provenance";
  selectedSlideIndex: number;
  
  setCurrentSession: (session: SessionItem | null) => void;
  setSessionsList: (sessions: SessionItem[]) => void;
  addSession: (session: SessionItem) => void;
  fetchSessionsList: (forceRefresh?: boolean) => Promise<void>;
  setDocuments: (docs: DocumentItem[]) => void;
  setCurrentCCO: (cco: CCOData | null) => void;
  setEvidenceChunks: (chunks: EvidenceChunk[]) => void;
  setActiveTab: (tab: SessionStoreState["activeTab"]) => void;
  setSelectedSlideIndex: (index: number) => void;
}

export const useSessionStore = create<SessionStoreState>()(
  devtools(
    (set, get) => ({
      currentSession: null,
      sessionsList: [],
      hasLoadedSessions: false,
      isSessionsLoading: false,
      documents: [],
      currentCCO: null,
      evidenceChunks: [],
      activeTab: "overview",
      selectedSlideIndex: 0,

      setCurrentSession: (session) => set({ currentSession: session }),
      setSessionsList: (sessionsList) => set({ sessionsList, hasLoadedSessions: true }),
      addSession: (session) => set((state) => ({
        sessionsList: [session, ...state.sessionsList.filter((s) => s.id !== session.id)],
        hasLoadedSessions: true,
      })),

      fetchSessionsList: async (forceRefresh = false) => {
        const { hasLoadedSessions, isSessionsLoading } = get();
        // If already loading in progress, avoid duplicate request
        if (isSessionsLoading) return;

        // If not loaded yet, set loading to true for initial placeholder
        if (!hasLoadedSessions || forceRefresh) {
          set({ isSessionsLoading: true });
        }

        try {
          const data = await fetchSessions();
          if (Array.isArray(data)) {
            set({ sessionsList: data, hasLoadedSessions: true });
          }
        } catch (err) {
          console.error("Error in fetchSessionsList:", err);
        } finally {
          set({ isSessionsLoading: false });
        }
      },

      setDocuments: (documents) => set({ documents }),
      setCurrentCCO: (currentCCO) => set({ currentCCO }),
      setEvidenceChunks: (evidenceChunks) => set({ evidenceChunks }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setSelectedSlideIndex: (selectedSlideIndex) => set({ selectedSlideIndex }),
    }),
    { name: "SessionStore" }
  )
);

