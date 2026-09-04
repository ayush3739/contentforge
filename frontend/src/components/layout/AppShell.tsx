"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useUser } from "@clerk/nextjs";
import { useUIStore } from "@/store/useUIStore";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);
  const { user, token } = useAuthStore();
  const { isSignedIn, isLoaded } = useUser();
  const { setThemeMode } = useUIStore();

  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  useEffect(() => {
    const saved = (localStorage.getItem("themeMode") as "light" | "dark" | null) ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setThemeMode(saved);
  }, [setThemeMode]);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  useEffect(() => {
    if (!isAuthPage && isLoaded && !isSignedIn && !token && !user) {
      router.push("/login");
    }
  }, [isAuthPage, isLoaded, isSignedIn, token, user, router]);

  if (isAuthPage) {
    return <main className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">{children}</main>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main ref={mainRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
