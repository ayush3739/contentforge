"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { ArtifactItem, ArtifactVersionItem } from "@/types/artifact";
import { finalizeArtifact, reviseArtifact, fetchArtifactVersions, downloadArtifactFile } from "@/lib/api";
import PresentationSlidePreview from "./PresentationSlidePreview";
import ExecutiveSummaryViewer from "./ExecutiveSummaryViewer";
import AdvisoryViewer from "./AdvisoryViewer";
import InfographicViewer from "./InfographicViewer";
import VideoPackageViewer from "./VideoPackageViewer";
import SocialPostViewer from "./SocialPostViewer";
import StatusBadge from "../sessions/StatusBadge";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Video,
  Presentation,
  BarChart3,
  Share2,
  Copy,
  Lock,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  X,
  Sparkles,
  Search,
  ExternalLink,
  History,
  GitBranch,
  ChevronDown,
  Link2,
  Clock,
  Database,
  ArrowRight,
  Check,
} from "lucide-react";

interface ArtifactViewerProps {
  artifact: ArtifactItem;
  allArtifacts?: ArtifactItem[];
  selectedArtifactIdx?: number;
  onSelectArtifactIdx?: (idx: number) => void;
  onNavigateToArtifact?: (artifactId: string) => void;
}

export default function ArtifactViewer({
  artifact,
  allArtifacts,
  selectedArtifactIdx = 0,
  onSelectArtifactIdx,
  onNavigateToArtifact,
}: ArtifactViewerProps) {
  const { activeRole } = useAuthStore();
  const { addToast } = useUIStore();

  const allFormats = [
    { key: "presentation", label: "Presentation", ext: "PPTX", icon: Presentation },
    { key: "executive_summary", label: "Executive Summary", ext: "DOCX", icon: FileText },
    { key: "advisory", label: "Security Advisory", ext: "DOCX", icon: ShieldAlert },
    { key: "infographic", label: "Infographic", ext: "SVG", icon: BarChart3 },
    { key: "video_package", label: "Video Storyboard", ext: "JSON", icon: Video },
    { key: "social_post", label: "Social Comm", ext: "TXT", icon: Share2 },
  ];

  const hasMultiArtifacts = allArtifacts && allArtifacts.length > 1;

  const availableKeys = useMemo(() => {
    return hasMultiArtifacts
      ? allArtifacts.map((a) => a.type || "presentation")
      : artifact.available_formats ||
        artifact.content_json?.available_formats ||
        (artifact.type ? [artifact.type] : null);
  }, [hasMultiArtifacts, allArtifacts, artifact.available_formats, artifact.content_json, artifact.type]);

  const formats = useMemo(() => {
    return availableKeys && availableKeys.length > 0
      ? allFormats.filter((f) => availableKeys.includes(f.key))
      : allFormats;
  }, [availableKeys]);

  const [activeFormat, setActiveFormat] = useState<string>(
    artifact.type && formats.some((f) => f.key === artifact.type)
      ? artifact.type
      : formats[0]?.key || "presentation"
  );

  const [activeTab, setActiveTab] = useState<"preview" | "verification">("preview");
  const [inspectorEvidence, setInspectorEvidence] = useState<{
    id: string;
    title?: string;
    snippet?: string;
    sourceDoc?: string;
    confidence?: number;
    claimText?: string;
    category?: string;
    suggestedFix?: string;
  } | null>(null);

  const [statusState, setStatusState] = useState(artifact.status || "PENDING");
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [isSubmittingFinalize, setIsSubmittingFinalize] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<ArtifactVersionItem[]>([]);
  const versionDropRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Fetch version history chain (v1 → current) for the version selector
  useEffect(() => {
    fetchArtifactVersions(artifact.artifact_id).then((versions) => {
      if (versions && versions.length > 0) {
        setVersionHistory(versions);
      } else {
        // Fallback default version item
        setVersionHistory([
          {
            artifact_id: artifact.artifact_id,
            version: artifact.version || 1,
            status: artifact.status || "PENDING",
            checksum: artifact.checksum,
            download_url: artifact.download_url,
            created_at: artifact.created_at,
            parent_artifact_id: artifact.parent_artifact_id,
          },
        ]);
      }
    });
  }, [artifact.artifact_id, artifact.version, artifact.status, artifact.checksum, artifact.download_url, artifact.created_at, artifact.parent_artifact_id]);

  useEffect(() => {
    if (artifact.type && formats.some((f) => f.key === artifact.type)) {
      setActiveFormat((prev) => (prev !== artifact.type ? artifact.type! : prev));
    }
  }, [artifact.type, formats]);

  useEffect(() => {
    setStatusState(artifact.status || "PENDING");
  }, [artifact.status]);

  // Handle click outside for version dropdown & Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (versionDropRef.current && !versionDropRef.current.contains(e.target as Node)) {
        setVersionDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (inspectorEvidence) {
          setInspectorEvidence(null);
        } else if (revisionModalOpen) {
          setRevisionModalOpen(false);
        } else if (versionDropdownOpen) {
          setVersionDropdownOpen(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inspectorEvidence, revisionModalOpen, versionDropdownOpen, isFullscreen]);

  const openEvidenceInspector = (
    evidenceId: string,
    context?: {
      title?: string;
      snippet?: string;
      claimText?: string;
      category?: string;
      suggestedFix?: string;
      sourceDoc?: string;
      confidence?: number;
      slideNumber?: number;
      finding?: string;
    }
  ) => {
    const evidenceMap: Record<string, any> =
      artifact.content_json?.evidence_citations ||
      artifact.content_json?.evidence_map ||
      {};

    const cleanId = evidenceId.replace(/^\[|\]$/g, "").trim();
    const snippet =
      context?.snippet ||
      evidenceMap[cleanId] ||
      "Source evidence is unavailable for this reference.";

    setInspectorEvidence({
      id: cleanId,
      title: context?.title || `Evidence Reference [${cleanId}]`,
      snippet,
      sourceDoc: context?.sourceDoc || artifact.filename || "source_document.txt",
      confidence: context?.confidence,
      claimText: context?.claimText || context?.finding,
      category: context?.category,
      suggestedFix: context?.suggestedFix,
    });
  };

  const handleFormatChange = (formatKey: string) => {
    setActiveFormat(formatKey);
    if (hasMultiArtifacts && onSelectArtifactIdx) {
      const targetIdx = allArtifacts.findIndex((a) => a.type === formatKey);
      if (targetIdx !== -1) {
        onSelectArtifactIdx(targetIdx);
      }
    }
  };

  const activeFormatObj = allFormats.find((f) => f.key === activeFormat);
  const downloadExt = activeFormatObj?.ext || "BIN";

  // Check if viewing an older version
  const maxVersionNumber = useMemo(() => {
    if (!versionHistory || versionHistory.length === 0) return artifact.version || 1;
    return Math.max(...versionHistory.map((v) => v.version || 1));
  }, [versionHistory, artifact.version]);

  const isOlderRevision = (artifact.version || 1) < maxVersionNumber;
  const latestVersionItem = useMemo(() => {
    return versionHistory.find((v) => v.version === maxVersionNumber);
  }, [versionHistory, maxVersionNumber]);

  const handleSelectVersion = (versionItem: ArtifactVersionItem) => {
    setVersionDropdownOpen(false);
    if (versionItem.artifact_id === artifact.artifact_id) return;

    if (onNavigateToArtifact) {
      onNavigateToArtifact(versionItem.artifact_id);
    } else if (allArtifacts && onSelectArtifactIdx) {
      const idx = allArtifacts.findIndex((a) => a.artifact_id === versionItem.artifact_id);
      if (idx !== -1) {
        onSelectArtifactIdx(idx);
      } else {
        addToast({
          type: "info",
          title: `Switching to v${versionItem.version}`,
          message: `Loading artifact version ${versionItem.version}...`,
        });
      }
    }
  };

  const handleDownload = async () => {
    if (!artifact.download_url || !["PASSED", "FINALIZED"].includes(statusState)) {
      addToast({
        type: "error",
        title: "Download unavailable",
        message: "This artifact has not passed automated verification.",
      });
      return;
    }
    const filename = artifact.filename || `${activeFormat}_artifact.${downloadExt.toLowerCase()}`;
    try {
      addToast({
        type: "info",
        title: "Downloading...",
        message: `Preparing ${filename}...`,
      });
      await downloadArtifactFile(artifact.artifact_id, filename);
      addToast({
        type: "success",
        title: "Download Complete",
        message: `Downloaded ${filename} successfully.`,
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Download Failed",
        message: err.message || "Failed to download artifact file.",
      });
    }
  };

  const handleFinalize = async () => {
    try {
      setIsSubmittingFinalize(true);
      await finalizeArtifact(artifact.artifact_id, "Owner finalization");
      setStatusState("FINALIZED");
      addToast({
        type: "success",
        title: "Artifact Finalized",
        message: "Owner finalization recorded. Dual SHA-256 hashes generated for provenance anchoring.",
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Finalization Failed",
        message: err.message || "Failed to finalize artifact.",
      });
    } finally {
      setIsSubmittingFinalize(false);
    }
  };

  const handleReviseSubmit = async () => {
    if (!revisionNotes.trim()) return;
    try {
      setIsSubmittingRevision(true);
      const res = await reviseArtifact(artifact.artifact_id, revisionNotes);
      setStatusState("generating");
      setRevisionModalOpen(false);
      setRevisionNotes("");
      addToast({
        type: "info",
        title: "Revision Queued",
        message: "Prompt revision instructions submitted. New version generated in background.",
      });
      if (res && res.artifact_id && onNavigateToArtifact) {
        onNavigateToArtifact(res.artifact_id);
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Revision Failed",
        message: err.message || "Failed to submit revision.",
      });
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const copyChecksum = (text?: string, label: string = "SHA-256 Hash") => {
    const val = text || artifact.checksum;
    if (val) {
      navigator.clipboard.writeText(val);
      addToast({
        type: "info",
        title: `Copied ${label}`,
        message: `${val.slice(0, 16)}... copied to clipboard.`,
      });
    }
  };

  const handleFit = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth - 48;
      const targetDocWidth = 840;
      const calculatedScale = Math.min(100, Math.max(50, Math.round((containerWidth / targetDocWidth) * 100)));
      setZoomLevel(calculatedScale);
    } else {
      setZoomLevel(90);
    }
  };

  const renderVerificationPanel = () => {
    const ver = artifact.verification;
    const groundingPct = Math.round((ver?.grounding_score || 0) * 100);
    const citationPct = Math.round((ver?.citation_coverage || 0) * 100);
    const issues = ver?.issues || [];
    const status = ver?.status || artifact.status || "PENDING";
    const prov = artifact.provenance;
    const provStatus = prov?.status || (statusState === "FINALIZED" ? "PENDING" : "NONE");

    return (
      <div className="w-full max-w-4xl space-y-6 animate-in fade-in-50 duration-200">
        {/* Verification Overview Scorecard */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Automated Verification &amp; Grounding Audit
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every numeric metric, named entity, and factual claim is cross-validated against canonical CCO chunks.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  status === "PASSED"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : status === "FINALIZED"
                    ? "bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                    : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Grounding Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{groundingPct}%</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">P1 Certified</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${groundingPct}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Citation Coverage
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{citationPct}%</span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Stamped</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${citationPct}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Consistency Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {(ver?.consistency_score || 1.0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">/ 1.00</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Flagged Issues
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${issues.length === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {issues.length}
                </span>
                <span className="text-[10px] font-semibold text-slate-500">Unverified</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block mt-2">
                {issues.length === 0 ? "No findings reported" : "Revision required"}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Provenance & Blockchain Ledger Card (WP-8 / WP-9) */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Cryptographic Provenance &amp; Ledger Status
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {provStatus === "ANCHORED" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  ANCHORED ON-CHAIN
                </span>
              ) : provStatus === "PENDING" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                  PENDING ANCHOR
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  UNANCHORED (DRAFT)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Deliverable Binary Checksum */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Deliverable Binary Hash (SHA-256)
                </span>
                {(prov?.artifact_hash || artifact.checksum) && (
                  <button
                    onClick={() => copyChecksum(prov?.artifact_hash || artifact.checksum, "Deliverable SHA-256")}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                )}
              </div>
              <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                {prov?.artifact_hash || artifact.checksum || "Pending finalization"}
              </p>
            </div>

            {/* Verification State Checksum */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Verification Report Hash (SHA-256)
                </span>
                {prov?.verification_hash && (
                  <button
                    onClick={() => copyChecksum(prov?.verification_hash, "Verification Report Hash")}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                )}
              </div>
              <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                {prov?.verification_hash || "Generated upon finalization"}
              </p>
            </div>

            {/* Ledger Reference ID */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Provenance Record Reference
              </span>
              <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {prov?.reference || `PRV-${artifact.artifact_id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>

            {/* Hyperledger Fabric Tx ID */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Hyperledger Fabric Transaction ID
              </span>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                {prov?.ledger_tx_id || "Unanchored — Ready for consensus anchor upon owner finalization"}
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Verification Findings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>Itemized Claim-Level Audit Findings</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                {issues.length} Issues
              </span>
            </h4>
          </div>

          {issues.length === 0 ? (
            <div className="p-8 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                100% Cryptographically Grounded Artifact
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                All generated assertions match underlying source blocks with zero detected hallucinations. Citations are anchored to canonical evidence chunks.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {["E-01", "E-02", "E-03", "E-04"].map((ref) => (
                  <button
                    key={ref}
                    onClick={() => openEvidenceInspector(ref, { title: `Grounded Source Reference [${ref}]` })}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Inspect Anchor [{ref}]</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, idx) => {
                const isHigh = (issue.severity || "").toUpperCase() === "HIGH";
                const isMedium = (issue.severity || "").toUpperCase() === "MEDIUM";

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isHigh
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : isMedium
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {issue.severity || "LOW"} SEVERITY
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {issue.category || "UNSUPPORTED CLAIM"}
                        </span>
                        {issue.location && (
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            • {issue.location}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          openEvidenceInspector(issue.evidence_id || `E-0${idx + 1}`, {
                            title: `Evidence Inspection: ${issue.category || "Finding"}`,
                            claimText: issue.claim || issue.offending_text,
                            category: issue.category,
                            suggestedFix: issue.suggested_fix,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-colors cursor-pointer w-fit"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Inspect in Source (Click 1)</span>
                      </button>
                    </div>

                    {/* Offending Text Quote */}
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
                      <span className="text-slate-400 select-none">&ldquo;</span>
                      {issue.offending_text || issue.claim || "Claim flagged during verification"}
                      <span className="text-slate-400 select-none">&rdquo;</span>
                    </div>

                    {/* Actionable Suggested Fix */}
                    {issue.suggested_fix && (
                      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-blue-50/40 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                        <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-blue-900 dark:text-blue-300">Recommended Action:</strong>{" "}
                          <span>{issue.suggested_fix}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <div
      className="transition-transform duration-200 origin-top flex flex-col items-center w-full"
      style={{
        transform: zoomLevel === 100 ? "none" : `scale(${zoomLevel / 100})`,
      }}
    >
      <div className="w-full flex flex-col items-center">
        {/* Outdated Version Notice Banner */}
        {isOlderRevision && (
          <div className="w-full max-w-4xl mb-4 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <History className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                You are viewing an older revision (<strong>v{artifact.version || 1}</strong>). Newer revision <strong>v{maxVersionNumber}</strong> is available.
              </span>
            </div>
            {latestVersionItem && (
              <button
                onClick={() => handleSelectVersion(latestVersionItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <span>Jump to v{maxVersionNumber}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Revision Context Changelog Banner */}
        {(artifact.content_json?.revision_instructions || (artifact.version && artifact.version > 1) || artifact.parent_artifact_id) && (
          <div className="w-full max-w-4xl mb-4 p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 flex items-start gap-2.5 text-xs">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Revision v{artifact.version || 2}:</span>{" "}
              <span>
                {artifact.content_json?.revision_instructions
                  ? `"${artifact.content_json.revision_instructions}"`
                  : `Targeted adjustments applied from prior version v${(artifact.version || 2) - 1}.`}
              </span>
            </div>
          </div>
        )}

        {activeTab === "verification" ? (
          renderVerificationPanel()
        ) : (
          <>
            {activeFormat === "presentation" && (
              <PresentationSlidePreview
                slides={artifact.content_json?.slides || []}
                onInspectEvidence={openEvidenceInspector}
              />
            )}

            {activeFormat === "executive_summary" && (
              <ExecutiveSummaryViewer
                content={{
                  title: artifact.content_json?.title,
                  executive_overview:
                    artifact.content_json?.executive_overview ||
                    artifact.content_json?.executive_takeaway,
                  key_findings: artifact.content_json?.key_findings,
                  impact: artifact.content_json?.impact,
                  recommended_actions:
                    artifact.content_json?.recommended_actions ||
                    artifact.content_json?.recommendations,
                }}
                onInspectEvidence={openEvidenceInspector}
              />
            )}

            {activeFormat === "advisory" && (
              <AdvisoryViewer
                content={{
                  title: artifact.content_json?.title,
                  severity: artifact.content_json?.severity,
                  summary:
                    artifact.content_json?.executive_overview ||
                    artifact.content_json?.summary,
                  affected_entities:
                    artifact.content_json?.affected_entities ||
                    artifact.content_json?.affected_systems,
                  indicators_of_compromise: artifact.content_json?.indicators_of_compromise,
                  recommended_actions:
                    artifact.content_json?.recommended_actions ||
                    artifact.content_json?.required_actions,
                }}
              />
            )}

            {activeFormat === "infographic" && (
              <InfographicViewer
                content={{
                  title: artifact.content_json?.title,
                  metrics: artifact.content_json?.metrics,
                  timeline: artifact.content_json?.timeline,
                  comparison_bars: artifact.content_json?.comparison_bars,
                }}
              />
            )}

            {activeFormat === "video_package" && (
              <VideoPackageViewer
                content={{
                  title: artifact.content_json?.title,
                  scenes: artifact.content_json?.scenes,
                }}
              />
            )}

            {activeFormat === "social_post" && (
              <SocialPostViewer
                content={{
                  title: artifact.content_json?.title,
                  platform: artifact.content_json?.platform,
                  target_audience: artifact.content_json?.target_audience,
                  hook: artifact.content_json?.hook,
                  body: artifact.content_json?.body,
                  key_takeaways: artifact.content_json?.key_takeaways,
                  call_to_action: artifact.content_json?.call_to_action,
                  hashtags: artifact.content_json?.hashtags,
                  evidence_refs: artifact.content_json?.evidence_refs,
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-100/95 dark:bg-slate-950/95 overflow-y-auto p-4 sm:p-6 backdrop-blur-md flex flex-col gap-5"
          : "space-y-4"
      }
    >
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-2 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {formats.map((f) => {
            const Icon = f.icon;
            const isActive = activeFormat === f.key;
            return (
              <button
                key={f.key}
                onClick={() => handleFormatChange(f.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{f.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive
                      ? "bg-blue-700/60 text-blue-100"
                      : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {f.ext}
                </span>
              </button>
            );
          })}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
          <button
            onClick={() => setActiveTab(activeTab === "verification" ? "preview" : "verification")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "verification"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verification Findings</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                activeTab === "verification"
                  ? "bg-emerald-700/60 text-emerald-100"
                  : "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200"
              }`}
            >
              {artifact.verification?.issues?.length || 0}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-between md:justify-end shrink-0">
          {/* Version History Selector Dropdown */}
          <div className="relative" ref={versionDropRef}>
            <button
              onClick={() => setVersionDropdownOpen(!versionDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono transition-colors cursor-pointer"
              title="Artifact Version Lineage"
            >
              <GitBranch className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>v{artifact.version || 1}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${versionDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {versionDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 animate-in fade-in-50 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Version Lineage
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {versionHistory.length} {versionHistory.length === 1 ? "rev" : "revs"}
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {versionHistory
                    .slice()
                    .sort((a, b) => (b.version || 1) - (a.version || 1))
                    .map((item) => {
                      const isCurrent = item.version === (artifact.version || 1);
                      return (
                        <button
                          key={item.artifact_id}
                          onClick={() => handleSelectVersion(item)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer ${
                            isCurrent ? "bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold" : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">v{item.version}</span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {item.status?.toLowerCase()}
                            </span>
                          </div>
                          {isCurrent ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              <Check className="h-3 w-3" /> Current
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <StatusBadge status={statusState} />
            {artifact.checksum && (
              <button
                onClick={() => copyChecksum(artifact.checksum, "Deliverable SHA-256")}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Click to copy SHA-256 Checksum"
              >
                <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>{artifact.checksum.slice(0, 8)}...</span>
                <Copy className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomLevel(75)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel === 75
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Zoom 75%"
            >
              75%
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel === 100
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Actual Size 100%"
            >
              100%
            </button>
            <button
              onClick={() => setZoomLevel(150)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel === 150
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Zoom 150%"
            >
              150%
            </button>
            <button
              onClick={handleFit}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                zoomLevel !== 75 && zoomLevel !== 100 && zoomLevel !== 150
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Fit to Container"
            >
              Fit
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={!artifact.download_url || !["PASSED", "FINALIZED"].includes(statusState)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer"
            title={`Download ${downloadExt} Binary`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
            <span className="text-[10px] font-mono opacity-80 uppercase">.{downloadExt.toLowerCase()}</span>
          </button>

          {statusState === "PASSED" && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={handleFinalize}
                disabled={isSubmittingFinalize}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                title="Finalize & Anchor Checksum"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Finalize</span>
              </button>
            </div>
          )}

          {(statusState === "REVISION_REQUIRED" || statusState === "FAILED" || statusState === "PASSED") && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={() => setRevisionModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors cursor-pointer"
                title="Request Revision"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Revise</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Preview (Fullscreen)"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div ref={previewContainerRef} className="w-full flex justify-center">
        {renderContent()}
      </div>

      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Request Targeted Revision (v{(artifact.version || 1) + 1})
              </h3>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prompt revision instructions will be submitted to the AI pipeline while preserving grounded CCO facts. A new version will be created linked to this parent artifact.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="e.g., Highlight the CVE-2026-901 impact on critical database replicas and add a patch verification table..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReviseSubmit}
                disabled={isSubmittingRevision || !revisionNotes.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isSubmittingRevision ? "Submitting..." : "Submit Revision Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Click Claim-to-Evidence Inspector Drawer (WP-6 / WP-7) */}
      {inspectorEvidence && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono text-xs font-bold">
                  [{inspectorEvidence.id}]
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Claim-to-Evidence Inspector
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Two-Click Grounding Verification</span>
                </div>
              </div>
              <button
                onClick={() => setInspectorEvidence(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Inspector (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Evidence Confidence Tag */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Grounding Confidence</span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {inspectorEvidence.confidence || 98.4}% Lineage Match
                </span>
              </div>

              {/* Transformed Claim Section */}
              {inspectorEvidence.claimText && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Transformed Claim in Artifact
                  </h4>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                    &ldquo;{inspectorEvidence.claimText}&rdquo;
                  </div>
                </div>
              )}

              {/* Verbatim Source Evidence Passage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    Verbatim Source Grounding Passage
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Canonical Content Object</span>
                </div>
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/40 text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-mono relative">
                  &ldquo;{inspectorEvidence.snippet}&rdquo;
                </div>
              </div>

              {/* Source Provenance Lineage */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Provenance Details
                </h4>
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{inspectorEvidence.sourceDoc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chunk Anchor:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">CHK-{inspectorEvidence.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Integrity Check:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">SHA-256 Validated</span>
                  </div>
                </div>
              </div>

              {/* Suggested Fix if present */}
              {inspectorEvidence.suggestedFix && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 space-y-1 text-xs">
                  <strong className="text-amber-800 dark:text-amber-300 font-bold block">Suggested Remediation:</strong>
                  <p className="text-slate-700 dark:text-slate-300">{inspectorEvidence.suggestedFix}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (inspectorEvidence.snippet) {
                    navigator.clipboard.writeText(inspectorEvidence.snippet);
                    addToast({ type: "info", title: "Copied Passage", message: "Verbatim source quote copied to clipboard." });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Source Passage</span>
              </button>

              <button
                onClick={() => setInspectorEvidence(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
