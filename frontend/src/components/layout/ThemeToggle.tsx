"use client";

import React, { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { themeMode, toggleThemeMode, setThemeMode } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("themeMode") as "light" | "dark" | null;
    if (saved) {
      setThemeMode(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeMode("dark");
    }
  }, [setThemeMode]);

  const isDark = mounted && themeMode === "dark";

  return (
    <button
      onClick={toggleThemeMode}
      suppressHydrationWarning
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`p-2 rounded-xl transition-all border shadow-2xs cursor-pointer flex items-center justify-center ${
        isDark
          ? "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
