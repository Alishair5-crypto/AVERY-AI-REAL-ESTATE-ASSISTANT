"use client";

import Image from "next/image";
import { useState } from "react";
import type { Property } from "@/lib/db-types";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PropertyDetailsModal } from "@/components/PropertyDetailsModal";

export function PropertyCard({
  property,
  onRequestShowing,
  compact,
}: {
  property: Property;
  onRequestShowing?: (propertyId: number) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const images = property.images as string[];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 w-full bg-slate-100">
        {images?.[0] ? (
          <Image src={images[0]} alt={property.address} fill sizes="320px" className="object-cover" unoptimized />
        ) : null}
        <div className="absolute left-2 top-2">
          <StatusBadge status={property.availability} />
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          Demo Listing
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-lg font-semibold leading-tight text-slate-900">
            {formatPrice(property.price, property.listingType)}
          </p>
          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
            {property.propertyType}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          {property.address}, {property.city}, {property.state} {property.zip}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-700">
          <span>{property.bedrooms} bd</span>
          <span>{Number(property.bathrooms)} ba</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>
        {!compact && <p className="line-clamp-2 text-sm text-slate-500">{property.description}</p>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setOpen(true)}
            className={`rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 ${onRequestShowing ? "flex-1" : "w-full"}`}
          >
            View Property
          </button>
          {onRequestShowing && (
            <button
              onClick={() => onRequestShowing(property.id)}
              className="flex-1 rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
            >
              Request Showing
            </button>
          )}
        </div>
      </div>
      {open && (
        <PropertyDetailsModal
          property={property}
          onClose={() => setOpen(false)}
          onRequestShowing={onRequestShowing}
        />
      )}
    </div>
  );
}
