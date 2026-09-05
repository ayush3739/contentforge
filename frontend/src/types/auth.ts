export type Role = "analyst" | "admin";

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  role: Role;
  permissions: string[];
  status: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  activeRole: Role;
  setRole: (role: Role) => void;
  setUser: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;
}
