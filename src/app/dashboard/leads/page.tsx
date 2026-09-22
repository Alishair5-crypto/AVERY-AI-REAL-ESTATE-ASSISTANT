import Link from "next/link";
import { listLeads, listConversations } from "@/lib/avery/tools";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatMoney, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Property Matched",
  "Showing Requested",
  "Human Handoff",
  "Follow-up Due",
  "Closed",
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = status ?? "All";
  const [leads, conversations] = await Promise.all([listLeads(), listConversations()]);
  const conversationByLead = new Map(conversations.map((c) => [c.leadId, c.id]));

  const filtered = activeFilter === "All" ? leads : leads.filter((l) => l.status === activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">Every lead Avery has captured across all demo channels.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "All" ? "/dashboard/leads" : `/dashboard/leads?status=${encodeURIComponent(s)}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              activeFilter === s ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No new leads" body="New leads will appear here when Avery receives them." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Intent</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{l.name ?? "Unnamed lead"}</p>
                    <p className="text-xs text-slate-400">{l.phone ?? l.email ?? "No contact info yet"}</p>
                  </td>
                  <td className="px-4 py-3"><ChannelBadge channel={l.channel} /></td>
                  <td className="px-4 py-3 text-slate-600">{l.intent}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.budgetMax ? `Up to ${formatMoney(l.budgetMax)}` : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={l.priority} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(l.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {conversationByLead.has(l.id) && (
                      <Link
                        href={`/dashboard/conversations?id=${conversationByLead.get(l.id)}`}
                        className="text-xs font-medium text-brand-700 hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
