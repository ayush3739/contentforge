"use client";

import { SignIn } from "@clerk/nextjs";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, FileCheck2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuthStore();

  const handleGuestEntry = (role: "analyst" | "admin") => {
    setRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-200/60 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Institutional Branding & Governance Info */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ContentForge AI"
              className="h-14 w-14 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">ContentForge</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-xs font-black tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                National Document Transformation Engine &bull; SIH26154
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Institutional Document Intelligence & Provenance Portal
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Authenticate using your official government credentials. Access canonical semantic document extraction, 
              cross-platform communication artifacts, and immutable blockchain-anchored audit provenance.
            </p>
          </div>

          {/* Security & Architecture Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Zero-Hallucination CCO Grounding</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every transformed claim is mathematically mapped back to source chunks in the Canonical Content Object.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Automated Role Governance</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Privileges (Analyst vs Administrator) are securely evaluated from your authenticated enterprise identity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Cryptographic SHA-256 Ledger</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Off-chain binary artifacts and audit records are anchored to ensure tampering detection and compliance.
                </p>
              </div>
            </div>
          </div>

          {/* IT Compliance Notice */}
          <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Notice: Unauthorized access to this government communication platform is strictly prohibited under the Information Technology Act. All sessions are monitored and recorded.
          </div>
        </div>

        {/* Right Column: Clean Authentication Gateway */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col items-center">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Single Sign-On
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your official credentials below to enter the workspace
              </p>
            </div>

            {/* Clerk Sign In with Hash Routing */}
            <div className="w-full flex justify-center">
              <SignIn
                routing="hash"
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    card: "border-0 shadow-none p-0 w-full bg-transparent",
                    header: "hidden",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors",
                    footerActionLink: "text-blue-600 font-bold hover:underline",
                  },
                }}
              />
            </div>

            {/* Discreet Guest / Development Bypass */}
            <div className="w-full mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2">
              <div className="text-[11px] text-slate-400 font-medium">Development & Local Testing</div>
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => handleGuestEntry("analyst")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Enter as Analyst <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
                <button
                  onClick={() => handleGuestEntry("admin")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-700 transition-colors"
                >
                  Enter as Admin <ArrowRight className="h-3 w-3 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
