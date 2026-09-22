"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function FollowupActions({ id, status }: { id: number; status: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function act(action: "send" | "stop") {
    setBusy(true);
    try {
      await fetch(`/api/followups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status !== "Scheduled") {
    return <span className="text-xs text-slate-400">{status}</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        disabled={busy}
        onClick={() => act("send")}
        className="rounded-lg border border-brand-300 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40"
      >
        Send now
      </button>
      <button
        disabled={busy}
        onClick={() => act("stop")}
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        Stop
      </button>
    </div>
  );
}
