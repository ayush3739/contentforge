"use client";

import { SignIn } from "@clerk/nextjs";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, FileCheck2, ArrowRight, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

const clerk3DAppearance = {
  elements: {
    card: "border-0 shadow-none p-0 w-full bg-transparent",
    headerTitle: "text-slate-900 dark:text-white font-extrabold text-xl tracking-tight",
    headerSubtitle: "text-slate-500 dark:text-slate-400 text-xs font-medium mt-1",
    socialButtonsBlockButton:
      "border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transform active:scale-95",
    socialButtonsBlockButtonText: "font-bold text-xs text-slate-700 dark:text-slate-200",
    formButtonPrimary:
      "bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all transform active:scale-[0.98]",
    formFieldInput:
      "rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-inner transition-all font-medium py-2.5",
    formFieldLabel: "text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 tracking-wide",
    footerAction: "hidden",
    footer: "hidden",
    dividerLine: "bg-slate-200 dark:bg-slate-800",
    dividerText: "text-slate-400 dark:text-slate-500 text-[10px] font-mono font-bold uppercase tracking-widest bg-white dark:bg-slate-900 px-2",
    identityPreviewText: "text-slate-800 dark:text-slate-200 font-bold text-xs",
    identityPreviewEditButton: "text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline",
    formResendCodeLink: "text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline",
  },
};

export default function SignInPage() {
  const router = useRouter();
  const { setRole } = useAuthStore();

  const handleGuestEntry = (role: "analyst" | "admin") => {
    setRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100/70 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Top Right Floating Theme Toggle */}
      <div className="fixed top-5 right-6 z-50">
        <ThemeToggle className="shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-md" />
      </div>

      {/* 3D Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-gradient-to-br from-blue-300/40 to-indigo-400/30 dark:from-blue-600/20 dark:to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-gradient-to-tr from-indigo-200/40 to-purple-300/30 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Institutional Branding */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="flex items-center gap-3.5">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.15)] transform hover:rotate-3 transition-transform">
              <img
                src="/logo.png"
                alt="ContentForge AI"
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">ContentForge</span>
                <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black tracking-wide shadow-xs">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                National Document Intelligence Engine &bull; SIH26154
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Institutional Document Intelligence & Provenance Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Authenticate using your official credentials. Access canonical semantic document extraction, 
              cross-platform communication artifacts, and immutable blockchain-anchored audit provenance.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_-4px_rgba(37,99,235,0.12)] hover:-translate-y-0.5 transform transition-all duration-300 border-t-2 border-t-white dark:border-t-slate-800">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/60 dark:to-blue-900/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs shrink-0">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Zero-Hallucination CCO Grounding</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
                  Every transformed claim is mathematically mapped back to source chunks in the Canonical Content Object.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_-4px_rgba(99,102,241,0.12)] hover:-translate-y-0.5 transform transition-all duration-300 border-t-2 border-t-white dark:border-t-slate-800">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-950/60 dark:to-indigo-900/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Automated Role Governance</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
                  Privileges (Analyst vs Administrator) are securely evaluated from your authenticated enterprise identity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_30px_-4px_rgba(16,185,129,0.12)] hover:-translate-y-0.5 transform transition-all duration-300 border-t-2 border-t-white dark:border-t-slate-800">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 dark:from-emerald-950/60 dark:to-emerald-900/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Cryptographic SHA-256 Ledger</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-medium">
                  Off-chain binary artifacts and audit records are anchored to ensure tampering detection and compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed font-mono">
            Notice: Access to this communication platform is strictly monitored and recorded.
          </div>
        </div>

        {/* Right Column: Premium 3D Authentication Gateway */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md relative group">
            {/* 3D Ambient Glowing Backlight */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-600/30 rounded-[2.5rem] blur-xl opacity-80 group-hover:opacity-100 transition duration-500 -z-10" />

            {/* 3D Glassmorphic Elevated Main Container */}
            <div className="w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-[2.2rem] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12),0_10px_20px_-5px_rgba(37,99,235,0.08)] p-6 sm:p-8 flex flex-col items-center border-t-2 border-t-white dark:border-t-slate-800 transform transition-all duration-300">
              
              {/* Header Title */}
              <div className="text-center mb-5 w-full">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" /> Single Sign-On
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Enter your official credentials below to enter the workspace
                </p>
              </div>

              {/* Clerk Sign In Component */}
              <div className="w-full flex justify-center">
                <SignIn
                  routing="hash"
                  signUpUrl="/sign-up"
                  fallbackRedirectUrl="/dashboard"
                  appearance={clerk3DAppearance}
                />
              </div>

              {/* Internal Application Link to Sign Up */}
              <div className="mt-4 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Don&apos;t have an account? </span>
                <Link href="/sign-up" className="text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:underline">
                  Sign up here
                </Link>
              </div>

              {/* Discreet Guest / Development Bypass */}
              {process.env.NODE_ENV !== "production" && (
                <div className="w-full mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    Quick Dev Access
                  </div>
                  <div className="flex items-center gap-2.5 w-full">
                    <button
                      onClick={() => handleGuestEntry("analyst")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-850 hover:to-slate-100 dark:hover:to-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transform active:scale-95 transition-all cursor-pointer"
                    >
                      Analyst <ArrowRight className="h-3 w-3 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleGuestEntry("admin")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/40 hover:to-purple-100 dark:hover:to-purple-900 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-2xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 transform active:scale-95 transition-all cursor-pointer"
                    >
                      Admin <ArrowRight className="h-3 w-3 text-purple-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
