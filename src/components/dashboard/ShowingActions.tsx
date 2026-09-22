"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ShowingActions({ id, status }: { id: number; status: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setBusy(true);
    try {
      await fetch(`/api/showings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "Confirmed" || status === "Cancelled" || status === "Completed") {
    return <span className="text-xs text-slate-400">No further action</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        disabled={busy}
        onClick={() => updateStatus("Confirmed")}
        className="rounded-lg border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
      >
        Confirm
      </button>
      <button
        disabled={busy}
        onClick={() => updateStatus("Cancelled")}
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        Cancel
      </button>
    </div>
  );
}
