"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type { Lead, Message, Property } from "@/lib/db-types";
import { ChatMessageBubble } from "@/components/demo/ChatMessageBubble";
import { ChatInput } from "@/components/demo/ChatInput";
import { LeadSnapshot } from "@/components/demo/LeadSnapshot";
import { ScenarioPanel } from "@/components/demo/ScenarioPanel";
import { CHANNELS, type Channel } from "@/lib/types";

interface ChatApiResponse {
  conversationId: number;
  leadId: number;
  lead: Lead;
  conversation?: { state: Record<string, unknown> };
  messages: Message[];
}

async function postChat(body: Record<string, unknown>): Promise<ChatApiResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Avery is temporarily unavailable.");
  }
  return res.json();
}

export function DemoClient() {
  const [propertiesMap, setPropertiesMap] = useState<Record<number, Property>>({});
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState<Record<string, unknown>>({});
  const [channel, setChannel] = useState<Channel>("Website Chat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScenarios, setShowScenarios] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data: { properties: Property[] }) => {
        const map: Record<number, Property> = {};
        for (const p of data.properties) map[p.id] = p;
        setPropertiesMap(map);
      })
      .catch(() => {});
  }, []);

  const startConversation = useCallback(async (selectedChannel: Channel) => {
    setLoading(true);
    setError(null);
    try {
      const res = await postChat({ action: { type: "start" }, channel: selectedChannel });
      setConversationId(res.conversationId);
      setLeadId(res.leadId);
      setLead(res.lead);
      setMessages(res.messages);
      setConversationState((res.conversation?.state as Record<string, unknown>) ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startConversation("Website Chat");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    if (!conversationId || !leadId) return;
    setLoading(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), conversationId, sender: "customer", content: text, metadata: null, createdAt: new Date() },
    ]);
    try {
      const res = await postChat({ conversationId, leadId, message: text });
      setLead(res.lead);
      setMessages(res.messages);
      setConversationState((res.conversation?.state as Record<string, unknown>) ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestShowing(propertyId: number) {
    if (!conversationId || !leadId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postChat({ conversationId, leadId, action: { type: "request_showing", propertyId } });
      setLead(res.lead);
      setMessages(res.messages);
      setConversationState((res.conversation?.state as Record<string, unknown>) ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleHumanHandoff() {
    if (!conversationId || !leadId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postChat({ conversationId, leadId, action: { type: "human_handoff" } });
      setLead(res.lead);
      setMessages(res.messages);
      setConversationState((res.conversation?.state as Record<string, unknown>) ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMoreProperties() {
    if (!conversationId || !leadId) return;
    setLoading(true);
    try {
      const res = await postChat({ conversationId, leadId, action: { type: "more_properties" } });
      setLead(res.lead);
      setMessages(res.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRunScenario(key: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: key }),
      });
      if (!res.ok) throw new Error("Could not start scenario");
      const data: ChatApiResponse = await res.json();
      setConversationId(data.conversationId);
      setLeadId(data.leadId);
      setLead(data.lead);
      setMessages(data.messages);
      setConversationState({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      await startConversation(channel);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const handoffActive = lead?.status === "Human Handoff";
  const interestedProperty = lead?.propertyInterest ? propertiesMap[lead.propertyInterest] : null;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:px-8">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 font-display text-sm font-semibold text-white">
              A
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-slate-900">Avery</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online · Demo Environment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={channel}
              onChange={(e) => {
                const next = e.target.value as Channel;
                setChannel(next);
                startConversation(next);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c} (Demo)
                </option>
              ))}
            </select>
            <Link href="/dashboard" className="hidden rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:inline-block">
              Open Dashboard →
            </Link>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5" style={{ minHeight: 420, maxHeight: 640 }}>
          {messages.map((m) => (
            <ChatMessageBubble
              key={m.id}
              message={m}
              propertiesMap={propertiesMap}
              onRequestShowing={handleRequestShowing}
              onMoreProperties={handleMoreProperties}
            />
          ))}
          {loading && (
            <div className="flex items-center gap-2 pl-9 text-xs text-slate-400">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:0.2s]" />
              </span>
              Avery is typing…
            </div>
          )}
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
        </div>

        <ChatInput
          onSend={handleSend}
          onHumanHandoff={handleHumanHandoff}
          disabled={loading || handoffActive || !conversationId}
          showMoreChip={Boolean(conversationState.hasSearched)}
          onMoreProperties={handleMoreProperties}
        />
      </div>

      <div className="w-full space-y-4 lg:w-80 xl:w-96">
        <button
          onClick={() => setShowScenarios((s) => !s)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm font-medium text-slate-700 lg:hidden"
        >
          {showScenarios ? "Hide" : "Show"} Demo Controls &amp; Lead Snapshot
        </button>
        <div className={`${showScenarios ? "block" : "hidden"} space-y-4 lg:block`}>
          <ScenarioPanel onRun={handleRunScenario} onReset={handleReset} loading={loading} />
          <LeadSnapshot lead={lead} property={interestedProperty} />
        </div>
      </div>
    </div>
  );
}
