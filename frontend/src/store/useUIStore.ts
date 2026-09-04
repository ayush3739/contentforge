import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface UIStoreState {
  sidebarOpen: boolean;
  themeMode: "light" | "dark";
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  toggleThemeMode: () => void;
  setThemeMode: (mode: "light" | "dark") => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("themeMode") as "light" | "dark";
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
};

export const useUIStore = create<UIStoreState>()(
  devtools(
    (set, get) => ({
      sidebarOpen: true,
      themeMode: "light",
      toasts: [],

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleThemeMode: () => {
        const current = get().themeMode;
        const nextMode = current === "dark" ? "light" : "dark";
        if (typeof window !== "undefined") {
          localStorage.setItem("themeMode", nextMode);
          if (nextMode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        set({ themeMode: nextMode });
      },

      setThemeMode: (mode) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("themeMode", mode);
          if (mode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        set({ themeMode: mode });
      },

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));

        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 4000);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    { name: "UIStore" }
  )
);

