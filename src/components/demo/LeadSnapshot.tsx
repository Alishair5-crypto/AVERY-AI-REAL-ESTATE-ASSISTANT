"use client";

import type { Lead, Property } from "@/lib/db-types";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { formatMoney } from "@/lib/format";

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function LeadSnapshot({ lead, property }: { lead: Lead | null; property?: Property | null }) {
  if (!lead) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Lead details will appear here once the conversation starts.
      </div>
    );
  }

  const budget =
    lead.budgetMin && lead.budgetMax
      ? `${formatMoney(lead.budgetMin)} – ${formatMoney(lead.budgetMax)}`
      : lead.budgetMax
        ? `Up to ${formatMoney(lead.budgetMax)}`
        : undefined;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-slate-900">Lead Snapshot</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Live Demo Data
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={lead.status} />
        <PriorityBadge priority={lead.priority} />
        <ChannelBadge channel={lead.channel} />
      </div>

      <div className="divide-y divide-slate-100">
        <Row label="Name" value={lead.name ?? "Not yet provided"} />
        <Row label="Phone" value={lead.phone ?? "Not yet provided"} />
        <Row label="Email" value={lead.email ?? "Not yet provided"} />
        <Row label="Intent" value={lead.intent} />
        <Row label="Location" value={lead.locationPreference} />
        <Row label="Budget" value={budget} />
        <Row label="Property Type" value={lead.propertyType} />
        <Row label="Bedrooms" value={lead.bedrooms} />
        <Row label="Timeline" value={lead.timeline} />
        <Row label="Financing" value={lead.financing} />
        <Row label="Move-in" value={lead.moveInDate} />
        <Row label="Pets" value={lead.pets} />
        <Row label="Seller address" value={lead.sellerAddress} />
        <Row label="Showing status" value={lead.showingStatus} />
      </div>

      {property && (
        <div className="rounded-xl bg-brand-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Property Interest</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{property.address}</p>
          <p className="text-xs text-slate-500">
            {property.city}, {property.state} · {property.propertyType}
          </p>
        </div>
      )}

      {lead.status === "Human Handoff" && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          This conversation has been handed off to a human agent. Avery will no longer auto-respond.
        </div>
      )}
    </div>
  );
}
