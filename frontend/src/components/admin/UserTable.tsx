"use client";

import { useEffect, useState } from "react";
import { UserAccount } from "@/types/admin";
import { getRoleBadgeClass } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { provisionAdminUser, updateUserRole } from "@/lib/api";
import { Users, UserPlus, RefreshCw, CheckCircle, AlertCircle, X } from "lucide-react";

export default function UserTable() {
  const { user: currentUser } = useAuthStore();
  const {
    usersList: users,
    isUsersLoading,
    hasLoadedUsers,
    fetchUsersList,
    addUser,
    updateUserRoleInStore,
  } = useAdminStore();

  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("analyst");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchUsersList(currentUser);
  }, [currentUser, fetchUsersList]);

  const isLoading = !hasLoadedUsers && isUsersLoading;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await provisionAdminUser({
        email: newEmail,
        name: newName,
        role: newRole,
      });
      if (res && res.id) {
        addUser(res);
      }
      setFeedback({ type: "success", message: `User ${newName} successfully provisioned.` });
      setNewEmail("");
      setNewName("");
      setShowModal(false);
      await fetchUsersList(currentUser, true);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to create user." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: string) => {
    try {
      updateUserRoleInStore(userId, targetRole);
      await updateUserRole(userId, targetRole);
      await fetchUsersList(currentUser, true);
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Workspace Account Governance
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
              {users.length} Active Accounts
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time database users, Clerk identity bindings, and live RBAC permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsersList(currentUser, true)}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Provision User
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Provision New System Account
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@contentforge.ai"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">RBAC Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                >
                  <option value="analyst">Analyst (Upload & Transform)</option>
                  <option value="reviewer">Reviewer (Review & Approve)</option>
                  <option value="admin">Administrator (Full Access & Governance)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitting ? "Provisioning..." : "Confirm & Provision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 font-sans">
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">User ID</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Name & Email</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Clerk Identifier</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Role</th>
              <th className="py-3 px-3.5 font-bold uppercase text-[10px] tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-medium">
                  Loading workspace user records from PostgreSQL database...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-500 font-medium">
                  No accounts found. Click "Provision User" to create one.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">{u.id}</td>
                  <td className="py-3.5 px-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-3.5 font-mono text-slate-500 dark:text-slate-400">{u.clerk_id}</td>
                  <td className="py-3.5 px-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getRoleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

