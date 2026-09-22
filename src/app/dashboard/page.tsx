import Link from "next/link";
import { listLeads, listShowings, listFollowups } from "@/lib/avery/tools";

export const dynamic = "force-dynamic";

function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function OverviewPage() {
  const [leads, showings, followups] = await Promise.all([listLeads(), listShowings(), listFollowups()]);

  const newLeads = leads.filter((l) => l.status === "New").length;
  const qualifiedLeads = leads.filter((l) =>
    ["Qualified", "Property Matched", "Showing Requested", "Human Handoff", "Closed"].includes(l.status),
  ).length;
  const highPriority = leads.filter((l) => l.priority === "High").length;
  const propertyMatches = leads.filter((l) => l.propertyInterest !== null).length;
  const showingRequests = showings.length;
  const followupsDue = leads.filter((l) => l.status === "Follow-up Due").length;

  const funnel = [
    { label: "New Lead", value: leads.length },
    { label: "Qualified", value: qualifiedLeads },
    { label: "Property Match", value: propertyMatches },
    { label: "Showing Requested", value: showings.length },
    { label: "Human Handoff", value: leads.filter((l) => l.status === "Human Handoff").length },
  ];
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live counts from the demo database — reset the demo anytime from the Avery chat screen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="New Leads" value={newLeads} />
        <Metric label="Qualified Leads" value={qualifiedLeads} />
        <Metric label="High Priority" value={highPriority} />
        <Metric label="Property Matches" value={propertyMatches} />
        <Metric label="Showing Requests" value={showingRequests} />
        <Metric label="Follow-ups Due" value={followupsDue} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">Conversion Funnel</h2>
        <p className="mt-1 text-xs text-slate-500">New Lead → Qualified → Property Match → Showing Request → Human Handoff</p>
        <div className="mt-6 space-y-3">
          {funnel.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs font-medium text-slate-600">{f.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-700"
                  style={{ width: `${Math.max(4, (f.value / maxFunnel) * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {leads.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-700">No new leads</p>
          <p className="mt-1 text-sm text-slate-500">New leads will appear here when Avery receives them.</p>
          <Link href="/demo" className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800">
            Try the Avery demo
          </Link>
        </div>
      )}

      {followups.length > 0 && (
        <p className="text-xs text-slate-400">Follow-ups tracked: {followups.length} — see the Follow-ups tab for details.</p>
      )}
    </div>
  );
}
