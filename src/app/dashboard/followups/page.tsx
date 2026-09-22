import { listFollowups, listLeads } from "@/lib/avery/tools";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FollowupActions } from "@/components/dashboard/FollowupActions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FollowupsPage() {
  const [followups, leads] = await Promise.all([listFollowups(), listLeads()]);
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-slate-500">
          Avery schedules a follow-up when a qualifying lead goes quiet. Follow-ups stop automatically after a reply or human takeover.
        </p>
      </div>

      {followups.length === 0 ? (
        <EmptyState title="You're all caught up" body="Follow-ups will appear here when a lead goes quiet mid-conversation." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Attempt</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Scheduled</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {followups.map((f) => {
                const lead = leadMap.get(f.leadId);
                return (
                  <tr key={f.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{lead?.name ?? "Unnamed lead"}</p>
                      <p className="text-xs text-slate-400">{lead?.locationPreference ?? lead?.channel}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-slate-600">
                      <p className="line-clamp-2">{f.message}</p>
                      {f.stopReason && <p className="mt-0.5 text-[11px] text-slate-400">Stopped: {f.stopReason}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">#{f.attemptNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(f.scheduledAt)}</td>
                    <td className="px-4 py-3"><FollowupActions id={f.id} status={f.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
