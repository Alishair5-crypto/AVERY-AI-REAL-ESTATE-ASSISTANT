"use client";

import { useState } from "react";
import type { Agent } from "@/lib/db-types";

interface SettingsData {
  id: number;
  businessName: string;
  agentTeamName: string;
  serviceAreas: string[];
  assistantName: string;
  greeting: string;
  tone: string;
  handoffEnabled: boolean;
  followupEnabled: boolean;
  maxFollowupAttempts: number;
  followupDelayMinutes: number;
}

export function SettingsForm({ initial, agents }: { initial: SettingsData; agents: Agent[] }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Demo Mode Active.</strong> Settings changes apply to this demo environment only and do not affect any
        production system.
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Business Profile</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Business name</span>
            <input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Agent / team name</span>
            <input
              value={form.agentTeamName}
              onChange={(e) => setForm({ ...form, agentTeamName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-600">Service areas</span>
            <input
              value={form.serviceAreas.join(", ")}
              onChange={(e) => setForm({ ...form, serviceAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Avery Settings</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Assistant name</span>
            <input
              value={form.assistantName}
              onChange={(e) => setForm({ ...form, assistantName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Tone</span>
            <select
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Concise</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-600">Greeting message</span>
            <textarea
              value={form.greeting}
              onChange={(e) => setForm({ ...form, greeting: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.handoffEnabled}
              onChange={(e) => setForm({ ...form, handoffEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="font-medium text-slate-600">Allow human handoff requests</span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Follow-up Settings</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm sm:col-span-3">
            <input
              type="checkbox"
              checked={form.followupEnabled}
              onChange={(e) => setForm({ ...form, followupEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="font-medium text-slate-600">Enable automatic follow-ups</span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Max attempts</span>
            <input
              type="number"
              min={1}
              max={10}
              value={form.maxFollowupAttempts}
              onChange={(e) => setForm({ ...form, maxFollowupAttempts: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Delay (minutes)</span>
            <input
              type="number"
              min={5}
              value={form.followupDelayMinutes}
              onChange={(e) => setForm({ ...form, followupDelayMinutes: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Team (Demo Agents)</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {agents.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">{a.name}</p>
              <p className="text-xs text-slate-500">{a.title}</p>
              <p className="mt-1 text-xs text-slate-400">{a.email} · {a.phone}</p>
              <p className="mt-1 text-xs text-slate-400">Areas: {(a.serviceAreas as string[]).join(", ")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
      </div>
    </div>
  );
}
