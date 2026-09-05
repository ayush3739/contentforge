import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusBadgeClass(status: string): string {
  const s = status?.toLowerCase() || "";
  if (s.includes("verified") || s.includes("completed") || s.includes("ready") || s.includes("passed") || s.includes("active")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
  }
  if (s.includes("review") || s.includes("pending") || s.includes("warning")) {
    return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
  }
  if (s.includes("failed") || s.includes("rejected") || s.includes("error")) {
    return "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
  }
  if (s.includes("processing") || s.includes("generating") || s.includes("ingesting")) {
    return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
  }
  return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
}

export function getRoleBadgeClass(role: string): string {
  const r = role?.toLowerCase() || "";
  if (r.includes("admin")) {
    return "bg-purple-50 text-purple-700 border-purple-200 font-semibold";
  }
  if (r.includes("reviewer")) {
    return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
  }
  if (r.includes("analyst")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
  }
  return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
}
