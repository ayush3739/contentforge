"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";
import { useRouter } from "next/navigation";
import { Flame, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuthStore();

  const handleSelectRole = (role: Role) => {
    setRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl space-y-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold mx-auto shadow-lg shadow-blue-500/20">
          <Flame className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-100">CONTENTFORGE AI</h1>
          <p className="text-xs text-cyan-400 font-mono mt-1">SIH 2026 — Team Elite Coders (SIH26154)</p>
          <p className="text-xs text-slate-400 mt-2">Internal Content Transformation & Provenance Platform</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-300">Select Operator Role to Sign In:</p>
          <button
            onClick={() => handleSelectRole("analyst")}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 font-semibold text-xs transition-all group"
          >
            <div className="text-left">
              <div>Analyst Operator</div>
              <div className="text-[10px] text-slate-400 font-normal">Create sessions, upload sources, plan & generate</div>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleSelectRole("reviewer")}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 font-semibold text-xs transition-all group"
          >
            <div className="text-left">
              <div>Reviewer Sign-Off</div>
              <div className="text-[10px] text-slate-400 font-normal">Grounding verification, approval queue, revise & finalize</div>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleSelectRole("admin")}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-semibold text-xs transition-all group"
          >
            <div className="text-left">
              <div>System Administrator</div>
              <div className="text-[10px] text-slate-400 font-normal">User provisioning, audit logs, security event logs</div>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Integrated with Clerk Authentication & FastAPI
        </div>
      </div>
    </div>
  );
}
