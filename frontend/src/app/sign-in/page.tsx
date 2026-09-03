"use client";

import { SignIn } from "@clerk/nextjs";
import { Flame } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold shadow-lg shadow-blue-500/20">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">CONTENTFORGE AI</h1>
          <p className="text-[10px] text-cyan-400 font-mono">Sign in to your Clerk account</p>
        </div>
      </div>

      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "bg-slate-900/90 border border-slate-800 shadow-2xl rounded-3xl p-6",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl",
          },
        }}
      />
    </div>
  );
}
