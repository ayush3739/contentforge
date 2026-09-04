import { create } from "zustand";
import { AuthState, Role, UserProfile } from "@/types/auth";

export function getRoleFromEmail(email?: string | null): Role {
  if (!email) return "analyst";
  const lower = email.toLowerCase().trim();
  if (lower.includes("admin") || lower.startsWith("admin")) {
    return "admin";
  }
  return "analyst";
}

const permissionsMap: Record<Role, string[]> = {
  analyst: ["create_session", "upload_source", "generate", "view_verification"],
  reviewer: ["create_session", "upload_source", "generate", "view_verification", "approve_reject"],
  admin: [
    "create_session", "upload_source", "generate", "view_verification",
    "approve_reject", "manage_users", "manage_roles", "system_audit", "system_config"
  ],
};

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    user_id: "USR-ANALYST-001",
    username: "analyst01",
    email: "analyst01@contentforge.ai",
    role: "analyst",
    permissions: permissionsMap.analyst,
    status: "active",
  },
  token: "test-analyst-token",
  activeRole: "analyst",

  setRole: (role: Role) => {
    set((state) => ({
      activeRole: role,
      user: state.user
        ? {
            ...state.user,
            role: role,
            permissions: permissionsMap[role] || permissionsMap.analyst,
          }
        : null,
      token: `test-${role}-token`,
    }));
  },

  setUser: (user: UserProfile | null, token: string | null) => {
    const role = user?.role || (user?.email ? getRoleFromEmail(user.email) : "analyst");
    set({ user, token, activeRole: role });
  },

  logout: () => {
    set({ user: null, token: null, activeRole: "analyst" });
  },
}));

