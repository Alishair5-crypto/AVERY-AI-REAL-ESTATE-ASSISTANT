import { Suspense } from "react";
import { ConversationsClient } from "@/components/dashboard/ConversationsClient";

export const dynamic = "force-dynamic";

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Conversations</h1>
        <p className="mt-1 text-sm text-slate-500">Unified inbox across all simulated channels.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-slate-400">Loading conversations…</p>}>
        <ConversationsClient />
      </Suspense>
    </div>
  );
}
