import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AuthState, Role, UserProfile } from "@/types/auth";

export function getRoleFromClerk(publicMetadataRole?: unknown, email?: string | null): Role {
  if (
    typeof publicMetadataRole === "string" &&
    ["admin", "analyst"].includes(publicMetadataRole.toLowerCase())
  ) {
    return publicMetadataRole.toLowerCase() as Role;
  }
  return getRoleFromEmail(email);
}

export function getRoleFromEmail(email?: string | null): Role {
  // SECURITY NOTE: Roles should ultimately be derived from Clerk's public_metadata
  // (JWT claim `publicMetadata.role`) rather than email pattern matching.
  if (!email) return "analyst";
  const lower = email.toLowerCase().trim();
  const ADMIN_EMAILS: string[] = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  ).split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (ADMIN_EMAILS.length > 0 && ADMIN_EMAILS.includes(lower)) {
    return "admin";
  }
  return "analyst";
}

export const permissionsMap: Record<Role, string[]> = {
  analyst: ["create_session", "upload_source", "generate", "view_verification"],
  admin: [
    "create_session", "upload_source", "generate", "view_verification",
    "manage_users", "manage_roles", "system_audit", "system_config"
  ],
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      token: null,
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
            : {
                user_id: `USR-GUEST-${role.toUpperCase()}`,
                username: `guest_${role}`,
                email: `guest_${role}@contentforge.ai`,
                role: role,
                permissions: permissionsMap[role] || permissionsMap.analyst,
                status: "active",
              },
          token: state.token || `USR-GUEST-${role.toUpperCase()}`,
        }));
      },

      setUser: (user: UserProfile | null, token: string | null) => {
        const role = user?.role || (user?.email ? getRoleFromEmail(user.email) : "analyst");
        set({ user, token, activeRole: role });
      },

      logout: () => {
        set({ user: null, token: null, activeRole: "analyst" });
      },
    }),
    { name: "AuthStore", enabled: true }
  )
);

if (typeof window !== "undefined") {
  (window as any).useAuthStore = useAuthStore;
  (window as any).authStore = useAuthStore;
}



