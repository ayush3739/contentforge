import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { UserAccount, AuditLogItem, SecurityEventItem } from "@/types/admin";
import { Role } from "@/types/auth";
import { fetchAdminUsers, fetchAdminAuditLogs, fetchAdminSecurityEvents } from "@/lib/api";

interface AdminStoreState {
  usersList: UserAccount[];
  hasLoadedUsers: boolean;
  isUsersLoading: boolean;

  auditLogsList: AuditLogItem[];
  hasLoadedAuditLogs: boolean;
  isAuditLogsLoading: boolean;

  securityEventsList: SecurityEventItem[];
  hasLoadedSecurityEvents: boolean;
  isSecurityEventsLoading: boolean;

  fetchUsersList: (currentUser?: any, forceRefresh?: boolean) => Promise<void>;
  addUser: (user: UserAccount) => void;
  updateUserRoleInStore: (userId: string, role: string) => void;

  fetchAuditLogsList: (forceRefresh?: boolean) => Promise<void>;
  fetchSecurityEventsList: (forceRefresh?: boolean) => Promise<void>;
}

export const useAdminStore = create<AdminStoreState>()(
  devtools(
    (set, get) => ({
      usersList: [],
      hasLoadedUsers: false,
      isUsersLoading: false,

      auditLogsList: [],
      hasLoadedAuditLogs: false,
      isAuditLogsLoading: false,

      securityEventsList: [],
      hasLoadedSecurityEvents: false,
      isSecurityEventsLoading: false,

      fetchUsersList: async (currentUser, forceRefresh = false) => {
        const { hasLoadedUsers, isUsersLoading } = get();
        if (isUsersLoading) return;

        if (!hasLoadedUsers || forceRefresh) {
          set({ isUsersLoading: true });
        }

        try {
          const data = await fetchAdminUsers();
          if (Array.isArray(data) && data.length > 0) {
            set({ usersList: data, hasLoadedUsers: true });
          } else if (currentUser) {
            const fallbackUser: UserAccount = {
              id: currentUser.user_id,
              clerk_id: currentUser.user_id,
              name: currentUser.username || "Operator",
              email: currentUser.email || "operator@contentforge.ai",
              role: (currentUser.role || "admin") as Role,
              status: "active",
            };
            set({ usersList: [fallbackUser], hasLoadedUsers: true });
          }
        } catch (err) {
          console.error("Error fetching admin users into store:", err);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      addUser: (user) =>
        set((state) => ({
          usersList: [user, ...state.usersList.filter((u) => u.id !== user.id && u.email !== user.email)],
          hasLoadedUsers: true,
        })),

      updateUserRoleInStore: (userId, role) =>
        set((state) => ({
          usersList: state.usersList.map((u) => (u.id === userId ? { ...u, role: role as Role } : u)),
        })),

      fetchAuditLogsList: async (forceRefresh = false) => {
        const { hasLoadedAuditLogs, isAuditLogsLoading } = get();
        if (isAuditLogsLoading) return;

        if (!hasLoadedAuditLogs || forceRefresh) {
          set({ isAuditLogsLoading: true });
        }

        try {
          const data = await fetchAdminAuditLogs(100);
          if (Array.isArray(data)) {
            set({ auditLogsList: data, hasLoadedAuditLogs: true });
          }
        } catch (err) {
          console.error("Error fetching audit logs into store:", err);
        } finally {
          set({ isAuditLogsLoading: false });
        }
      },

      fetchSecurityEventsList: async (forceRefresh = false) => {
        const { hasLoadedSecurityEvents, isSecurityEventsLoading } = get();
        if (isSecurityEventsLoading) return;

        if (!hasLoadedSecurityEvents || forceRefresh) {
          set({ isSecurityEventsLoading: true });
        }

        try {
          const data = await fetchAdminSecurityEvents(100);
          if (Array.isArray(data)) {
            set({ securityEventsList: data, hasLoadedSecurityEvents: true });
          }
        } catch (err) {
          console.error("Error fetching security events into store:", err);
        } finally {
          set({ isSecurityEventsLoading: false });
        }
      },
    }),
    { name: "AdminStore" }
  )
);
