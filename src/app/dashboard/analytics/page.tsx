import { listLeads, listShowings, listFollowups } from "@/lib/avery/tools";

export const dynamic = "force-dynamic";

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-xs font-medium text-slate-600">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-700" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [leads, showings, followups] = await Promise.all([listLeads(), listShowings(), listFollowups()]);

  const byIntent: Record<string, number> = {};
  const byChannel: Record<string, number> = {};
  for (const l of leads) {
    byIntent[l.intent] = (byIntent[l.intent] ?? 0) + 1;
    byChannel[l.channel] = (byChannel[l.channel] ?? 0) + 1;
  }

  const funnel = [
    { label: "New Lead", value: leads.length },
    {
      label: "Qualified",
      value: leads.filter((l) =>
        ["Qualified", "Property Matched", "Showing Requested", "Human Handoff", "Closed"].includes(l.status),
      ).length,
    },
    { label: "Property Match", value: leads.filter((l) => l.propertyInterest !== null).length },
    { label: "Showing Requested", value: showings.length },
    { label: "Human Handoff", value: leads.filter((l) => l.status === "Human Handoff").length },
  ];
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));
  const maxIntent = Math.max(1, ...Object.values(byIntent));
  const maxChannel = Math.max(1, ...Object.values(byChannel));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Metrics are computed live from the demo database. No fabricated performance claims.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Total Leads</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Showings Requested</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{showings.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Human Handoffs</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">
            {leads.filter((l) => l.status === "Human Handoff").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase text-slate-500">Follow-ups Sent</p>
          <p className="mt-2 font-display text-2xl font-semibold text-slate-900">
            {followups.filter((f) => f.status === "Sent").length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Conversion Funnel</h2>
        <div className="mt-5 space-y-3">
          {funnel.map((f) => (
            <Bar key={f.label} label={f.label} value={f.value} max={maxFunnel} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900">Leads by Intent</h2>
          <div className="mt-5 space-y-3">
            {Object.entries(byIntent).length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
            {Object.entries(byIntent).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxIntent} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900">Leads by Channel</h2>
          <div className="mt-5 space-y-3">
            {Object.entries(byChannel).length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
            {Object.entries(byChannel).map(([k, v]) => (
              <Bar key={k} label={k} value={v} max={maxChannel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
