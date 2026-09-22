import { listShowings, listLeads, listProperties } from "@/lib/avery/tools";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShowingActions } from "@/components/dashboard/ShowingActions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [showings, leads, properties] = await Promise.all([listShowings(), listLeads(), listProperties()]);
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">Showing requests captured by Avery, pending agent confirmation.</p>
      </div>

      {showings.length === 0 ? (
        <EmptyState title="No showing requests" body="Showing requests will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Preferred Date</th>
                <th className="px-4 py-3 font-medium">Preferred Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {showings.map((s) => {
                const lead = leadMap.get(s.leadId);
                const property = propertyMap.get(s.propertyId);
                return (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{lead?.name ?? "Unnamed lead"}</p>
                      <p className="text-xs text-slate-400">{lead?.phone ?? lead?.email ?? "No contact yet"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {property ? `${property.address}, ${property.city}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.preferredDate}</td>
                    <td className="px-4 py-3 text-slate-600">{s.preferredTime}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(s.createdAt)}</td>
                    <td className="px-4 py-3"><ShowingActions id={s.id} status={s.status} /></td>
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
