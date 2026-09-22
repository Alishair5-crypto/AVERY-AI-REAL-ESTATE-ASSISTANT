"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Conversation, Lead, Message, Note, Property } from "@/lib/db-types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { LeadSnapshot } from "@/components/demo/LeadSnapshot";
import { timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/dashboard/EmptyState";

type ConversationRow = Conversation & { lead: Lead | null };

export function ConversationsClient() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ lead: Lead | null; messages: Message[]; notes: Note[]; properties: Property[] } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);
  const params = useSearchParams();
  const router = useRouter();

  const loadList = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setRows(data.conversations ?? []);
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const idParam = params.get("id");
    if (idParam) setSelectedId(Number(idParam));
  }, [params]);

  useEffect(() => {
    if (!selectedId && rows.length > 0) {
      setSelectedId(rows[0].id);
    }
  }, [rows, selectedId]);

  const loadDetail = useCallback(async (id: number) => {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setDetail(data);
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function handleHandoff() {
    if (!detail?.lead) return;
    setBusy(true);
    try {
      await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: detail.lead.id }),
      });
      await Promise.all([loadList(), selectedId ? loadDetail(selectedId) : Promise.resolve()]);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddNote() {
    if (!selectedId || !noteText.trim()) return;
    setBusy(true);
    try {
      await fetch(`/api/conversations/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText.trim(), author: "Agent (Demo)" }),
      });
      setNoteText("");
      await loadDetail(selectedId);
    } finally {
      setBusy(false);
    }
  }

  if (rows.length === 0) {
    return <EmptyState title="No conversations yet" body="Conversations will appear here once Avery receives a lead." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_300px]">
      <div className="space-y-2 lg:max-h-[75vh] lg:overflow-y-auto">
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              setSelectedId(r.id);
              router.replace(`/dashboard/conversations?id=${r.id}`);
            }}
            className={`block w-full rounded-xl border p-3 text-left transition ${
              selectedId === r.id ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-800">{r.lead?.name ?? "Unnamed lead"}</p>
              <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(r.updatedAt)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <ChannelBadge channel={r.channel} />
              {r.lead && <StatusBadge status={r.lead.status} />}
            </div>
            <p className="mt-1.5 truncate text-xs text-slate-500">{r.lead?.lastMessage ?? "No messages yet"}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {detail ? (
          <div className="flex h-full flex-col">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="font-display text-sm font-semibold text-slate-900">{detail.lead?.name ?? "Unnamed lead"}</p>
                <p className="text-xs text-slate-400">{detail.lead?.intent} inquiry</p>
              </div>
              <button
                onClick={handleHandoff}
                disabled={busy || detail.lead?.status === "Human Handoff"}
                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-40"
              >
                {detail.lead?.status === "Human Handoff" ? "Handed Off" : "Hand off to agent"}
              </button>
            </div>
            <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
              {detail.messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                  {m.sender === "system" ? (
                    <span className="mx-auto rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">{m.content}</span>
                  ) : (
                    <div
                      className={`max-w-[80%] rounded-xl px-3.5 py-2 text-sm ${
                        m.sender === "customer" ? "bg-brand-700 text-white" : "border border-slate-200 bg-slate-50 text-slate-800"
                      }`}
                    >
                      {m.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Internal Notes</p>
              <div className="mb-2 space-y-1.5">
                {detail.notes.length === 0 && <p className="text-xs text-slate-400">No notes yet.</p>}
                {detail.notes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{n.author}:</span> {n.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note…"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={busy || !noteText.trim()}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Select a conversation to view details.</p>
        )}
      </div>

      <div>
        <LeadSnapshot
          lead={detail?.lead ?? null}
          property={detail?.lead?.propertyInterest ? detail.properties.find((p) => p.id === detail.lead?.propertyInterest) : null}
        />
      </div>
    </div>
  );
}
