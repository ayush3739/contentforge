"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, FileCheck2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-slate-200/60 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Platform Branding */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ContentForge AI"
              className="h-12 w-12 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">ContentForge</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">National Document Transformation Engine</p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Create Authorized Operator Account
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register your verified email address to access workspace sessions, document ingestion pipelines, and cross-platform artifact renderers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <FileCheck2 className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Full access to CCO semantic extraction</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Lock className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Role privileges derived from verified email domain</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Cryptographic audit logs anchored off-chain</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Already registered? Sign in here
            </Link>
          </div>
        </div>

        {/* Right Column: Embedded Clerk SignUp */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col items-center">
            <SignUp
              routing="hash"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: "border-0 shadow-none p-0 w-full bg-transparent",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors",
                  footerActionLink: "text-blue-600 font-bold hover:underline",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
