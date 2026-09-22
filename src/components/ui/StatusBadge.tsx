const STATUS_STYLES: Record<string, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Contacted: "bg-sky-50 text-sky-700 border-sky-200",
  Qualified: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Property Matched": "bg-violet-50 text-violet-700 border-violet-200",
  "Showing Requested": "bg-amber-50 text-amber-800 border-amber-200",
  "Human Handoff": "bg-rose-50 text-rose-700 border-rose-200",
  "Follow-up Due": "bg-orange-50 text-orange-700 border-orange-200",
  Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  "Off Market": "bg-slate-100 text-slate-600 border-slate-200",
  "Pending Confirmation": "bg-amber-50 text-amber-800 border-amber-200",
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  Completed: "bg-slate-100 text-slate-600 border-slate-200",
  Requested: "bg-amber-50 text-amber-800 border-amber-200",
  Scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  Sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Stopped: "bg-slate-100 text-slate-500 border-slate-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-rose-600 text-white",
  Medium: "bg-amber-500 text-white",
  Low: "bg-slate-300 text-slate-800",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_STYLES[priority] ?? "bg-slate-300 text-slate-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${cls}`}>
      {priority} priority
    </span>
  );
}
