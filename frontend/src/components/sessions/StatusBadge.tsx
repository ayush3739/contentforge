"use client";

import { getStatusBadgeClass } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide uppercase ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
}
