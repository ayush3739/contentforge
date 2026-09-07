"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useUIStore } from "@/store/useUIStore";
import Link from "next/link";
import StatusBadge from "@/components/sessions/StatusBadge";
import {
  PlusCircle,
  Search,
  FileText,
  ArrowRight,
  FolderKanban,
  Calendar,
  User,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { updateSession, deleteSession } from "@/lib/api";
import { SessionItem } from "@/types/session";

export default function SessionsPage() {
  const { sessionsList, isSessionsLoading, hasLoadedSessions, fetchSessionsList, removeSession, updateSessionInList } = useSessionStore();
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [renameSession, setRenameSession] = useState<SessionItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteTargetSession, setDeleteTargetSession] = useState<SessionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSessionsList();
  }, [fetchSessionsList]);

  const showLoading = !hasLoadedSessions && isSessionsLoading;

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessionsList;
    const q = searchQuery.toLowerCase();
    return sessionsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.created_by && s.created_by.toLowerCase().includes(q))
    );
  }, [sessionsList, searchQuery]);

  const handleOpenRename = (e: React.MouseEvent, session: SessionItem) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameSession(session);
    setRenameValue(session.name);
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameSession || !renameValue.trim() || isRenaming) return;

    try {
      setIsRenaming(true);
      const updated = await updateSession(renameSession.id, { name: renameValue.trim() });
      updateSessionInList({ id: renameSession.id, name: renameValue.trim() });
      addToast({
        type: "success",
        title: "Session Renamed",
        message: `Workspace renamed to "${renameValue.trim()}".`,
      });
      setRenameSession(null);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Rename Failed",
        message: err.message || "Could not update session name.",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenDelete = (e: React.MouseEvent, session: SessionItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTargetSession(session);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetSession || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteSession(deleteTargetSession.id);
      removeSession(deleteTargetSession.id);
      addToast({
        type: "success",
        title: "Session Deleted",
        message: `Workspace "${deleteTargetSession.name}" was permanently removed.`,
      });
      setDeleteTargetSession(null);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Deletion Failed",
        message: err.message || "Could not delete the session workspace.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transformation Sessions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lightweight directory of workspaces. Full evidence graphs &amp; artifacts load lazily on opening.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-2xs w-48 sm:w-64 transition-all"
            />
          </div>
          <Link
            href="/sessions/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all shrink-0"
          >
            <PlusCircle className="h-4 w-4" /> New Session
          </Link>
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showLoading ? (
          // Skeleton Cards
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))
        ) : filteredSessions.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <FolderKanban className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {searchQuery ? "No matching sessions found" : "No active sessions found"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for a different keyword or session ID."
                : "Create your first transformation session to start grounding documents into CCO."}
            </p>
            {!searchQuery && (
              <div className="pt-2">
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <PlusCircle className="h-4 w-4" /> Create Workspace
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredSessions.map((s) => {
            const hasCounts = s.document_count !== undefined && s.document_count !== null;
            const formattedDate = s.created_at
              ? new Date(s.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={s.id}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all space-y-4 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-blue-700 dark:text-blue-300 font-bold uppercase bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                          {s.id}
                        </span>
                        <StatusBadge status={s.status} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {s.name}
                      </h3>
                      {s.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenRename(e, s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                        title="Rename Session Workspace"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDelete(e, s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                        title="Delete Session Workspace"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lightweight metadata row */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 py-2.5">
                    {hasCounts ? (
                      <>
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                          <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          {s.document_count} {s.document_count === 1 ? "Document" : "Documents"}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                          {s.transformation_count ?? 0} {s.transformation_count === 1 ? "Output" : "Outputs"}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">Workspace details load on open</span>
                    )}

                    {formattedDate && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                          <Calendar className="h-3 w-3" /> {formattedDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[180px]">
                    <User className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{s.created_by || "Institutional User"}</span>
                  </span>
                  <Link
                    href={`/sessions/${s.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group-hover:translate-x-0.5 transition-all"
                  >
                    Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rename Modal */}
      {renameSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Pencil className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rename Workspace</h3>
              </div>
              <button
                onClick={() => setRenameSession(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRename} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Workspace Title</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  placeholder="Enter workspace name..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameSession(null)}
                  disabled={isRenaming}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !renameValue.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isRenaming ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Session Workspace?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 dark:text-white font-semibold">&ldquo;{deleteTargetSession.name}&rdquo;</strong>? This will permanently remove the workspace, its ingested source documents, and all generated artifacts.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetSession(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" /> Delete Workspace
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
