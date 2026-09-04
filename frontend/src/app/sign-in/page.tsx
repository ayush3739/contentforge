"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      <div className="flex flex-col items-center mb-6 text-center">
        <img
          src="/logo.png"
          alt="ContentForge AI"
          className="h-16 w-16 object-contain drop-shadow-xs mb-2"
        />
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
          ContentForge <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-black">AI</span>
        </h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">Sign in to your Clerk account</p>
      </div>

      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            card: "bg-white border border-slate-200 shadow-xl rounded-3xl p-6",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs",
          },
        }}
      />
    </div>
  );
}
