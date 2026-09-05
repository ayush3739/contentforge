"use client";

import RoleGuard from "@/components/layout/RoleGuard";
import ReviewQueueTable from "@/components/review/ReviewQueueTable";

export default function ReviewQueuePage() {
  return (
    <RoleGuard allowedRoles={["admin", "reviewer"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reviewer Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Human sign-off workspace for flagged claims and grounding verification reports</p>
        </div>

        <ReviewQueueTable />
      </div>
    </RoleGuard>
  );
}
