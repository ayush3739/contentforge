import { create } from "zustand";
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

export const useSessionStore = create<SessionStoreState>((set) => ({
  currentSession: null,
  sessionsList: [],
  documents: [
    {
      id: "DOC-88412",
      session_id: "SES-INCIDENT-88412",
      name: "Incident_Report_Ransomware_Attack.pdf",
      mime_type: "application/pdf",
      version: 1,
      checksum: "a891f42e391b002c91847120a11c8d",
      status: "ready",
      created_at: new Date().toISOString(),
    },
  ],
  currentCCO: {
    document_id: "DOC-88412",
    cco_version_id: "CCO-v2-88412",
    version: 2,
    hash: "sha256:7f92a10b4291c9883b",
    title: "Incident Briefing: Ransomware Attack on Core Infrastructure",
    executive_overview: "Unauthorized activity compromised 14 production payment gateway systems. Total estimated financial impact is $2.5 million.",
    claims: [
      {
        id: "claim-001",
        text: "14 production cluster systems were compromised.",
        confidence: 0.98,
        source_sentence: "Unauthorized activity was observed across 14 systems in production.",
        evidence_refs: ["chunk-001"],
      },
      {
        id: "claim-002",
        text: "Threat actor exploited CVE-2024-3094.",
        confidence: 0.99,
        source_sentence: "The threat actor exploited CVE-2024-3094 leading to log exfiltration.",
        evidence_refs: ["chunk-001"],
      },
      {
        id: "claim-003",
        text: "450 GB of encrypted logs exfiltrated.",
        confidence: 0.95,
        source_sentence: "Exfiltration of 450 GB of encrypted log data occurred.",
        evidence_refs: ["chunk-002"],
      },
      {
        id: "claim-004",
        text: "Financial impact estimated at $2.5 million.",
        confidence: 0.94,
        source_sentence: "Estimated financial impact totals $2.5 million.",
        evidence_refs: ["chunk-002"],
      },
    ],
    identifiers: ["CVE-2024-3094", "INC-88412", "KB-9912"],
    key_findings: ["14 systems quarantined", "$2.5M financial impact", "CVE-2024-3094 patch required"],
  },
  evidenceChunks: [
    {
      chunk_id: "chunk-001",
      section: "Executive Summary",
      page: 1,
      text: "On August 14, 2026, unauthorized activity was observed across 14 systems in the production cluster. The threat actor exploited CVE-2024-3094.",
    },
    {
      chunk_id: "chunk-002",
      section: "Impact & Financial Assessment",
      page: 2,
      text: "Exfiltration of 450 GB of encrypted logs occurred prior to isolation. Total estimated financial impact is $2.5 million.",
    },
  ],
  activeTab: "overview",
  selectedSlideIndex: 0,

  setCurrentSession: (session) => set({ currentSession: session }),
  setSessionsList: (sessionsList) => set({ sessionsList }),
  setDocuments: (documents) => set({ documents }),
  setCurrentCCO: (currentCCO) => set({ currentCCO }),
  setEvidenceChunks: (evidenceChunks) => set({ evidenceChunks }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedSlideIndex: (selectedSlideIndex) => set({ selectedSlideIndex }),
}));
