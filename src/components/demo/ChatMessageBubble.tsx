"use client";

import type { Message } from "@/lib/db-types";
import type { Property } from "@/lib/db-types";
import { PropertyCard } from "@/components/PropertyCard";
import { formatDateTime } from "@/lib/format";

export function ChatMessageBubble({
  message,
  propertiesMap,
  onRequestShowing,
  onMoreProperties,
}: {
  message: Message;
  propertiesMap: Record<number, Property>;
  onRequestShowing: (propertyId: number) => void;
  onMoreProperties: () => void;
}) {
  const meta = message.metadata as Record<string, unknown> | null;

  if (message.sender === "system") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
          {message.content}
        </span>
      </div>
    );
  }

  const isCustomer = message.sender === "customer";

  return (
    <div className={`flex w-full flex-col ${isCustomer ? "items-end" : "items-start"}`}>
      <div className={`flex max-w-[88%] items-end gap-2 sm:max-w-[75%] ${isCustomer ? "flex-row-reverse" : ""}`}>
        {!isCustomer && (
          <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-semibold text-white">
            A
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isCustomer
              ? "rounded-br-sm bg-brand-700 text-white"
              : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
          }`}
        >
          {message.content}
        </div>
      </div>
      <span className="mt-1 px-9 text-[10px] text-slate-400">{formatDateTime(message.createdAt)}</span>

      {meta?.type === "property_results" && Array.isArray(meta.propertyIds) && (
        <div className="mt-2 w-full max-w-[95%] space-y-3 pl-9">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(meta.propertyIds as number[])
              .map((id) => propertiesMap[id])
              .filter(Boolean)
              .map((p) => (
                <PropertyCard key={p.id} property={p} onRequestShowing={onRequestShowing} compact />
              ))}
          </div>
          <button
            onClick={onMoreProperties}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            View More Properties
          </button>
        </div>
      )}

      {meta?.type === "showing_summary" && typeof meta.propertyId === "number" && propertiesMap[meta.propertyId] && (
        <div className="mt-2 w-full max-w-[95%] pl-9">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Showing Request · Pending Agent Confirmation</p>
            <p className="mt-1 text-sm text-slate-700">
              {propertiesMap[meta.propertyId].address}, {propertiesMap[meta.propertyId].city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
