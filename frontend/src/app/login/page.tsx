"use client";

import { SignIn } from "@clerk/nextjs";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole, activeRole } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold shadow-lg shadow-blue-500/20">
          <Flame className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">CONTENTFORGE AI</h1>
          <p className="text-xs text-cyan-400 font-mono">Clerk Authentication System (SIH26154)</p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Clerk Sign In Card */}
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "bg-slate-900/90 border border-slate-800 shadow-2xl rounded-3xl p-6 w-full",
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs py-2.5 rounded-xl",
            },
          }}
        />

        {/* Link to Signup */}
        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-cyan-400 font-semibold hover:underline">
            Create Clerk Account
          </Link>
        </div>

        {/* Demo Quick Role Switcher */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
            <UserCheck className="h-4 w-4 text-cyan-400" /> Demo Quick Access Role Switcher:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["analyst", "reviewer", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  router.push("/dashboard");
                }}
                className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  activeRole === r
                    ? "bg-blue-600/30 border border-blue-500 text-blue-300"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
