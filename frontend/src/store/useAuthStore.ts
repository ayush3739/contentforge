import { create } from "zustand";
import { AuthState, Role, UserProfile } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    user_id: "USR-ANALYST-001",
    username: "analyst01",
    email: "analyst01@contentforge.ai",
    role: "analyst",
    permissions: ["create_session", "upload_source", "generate", "view_verification"],
    status: "active",
  },
  token: "test-analyst-token",
  activeRole: "analyst",

  setRole: (role: Role) => {
    const permissionsMap: Record<Role, string[]> = {
      analyst: ["create_session", "upload_source", "generate", "view_verification"],
      reviewer: ["create_session", "upload_source", "generate", "view_verification", "approve_reject"],
      admin: [
        "create_session", "upload_source", "generate", "view_verification",
        "approve_reject", "manage_users", "manage_roles", "system_audit", "system_config"
      ],
    };

    set((state) => ({
      activeRole: role,
      user: state.user
        ? {
            ...state.user,
            role: role,
            permissions: permissionsMap[role],
          }
        : null,
      token: `test-${role}-token`,
    }));
  },

  setUser: (user: UserProfile | null, token: string | null) => {
    set({ user, token, activeRole: user?.role || "analyst" });
  },

  logout: () => {
    set({ user: null, token: null, activeRole: "analyst" });
  },
}));
