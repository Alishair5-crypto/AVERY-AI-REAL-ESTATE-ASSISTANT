"use client";

import Image from "next/image";
import { useState } from "react";
import type { Property } from "@/lib/db-types";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function PropertyDetailsModal({
  property,
  onClose,
  onRequestShowing,
}: {
  property: Property;
  onClose: () => void;
  onRequestShowing?: (propertyId: number) => void;
}) {
  const images = (property.images as string[]) ?? [];
  const [activeImage, setActiveImage] = useState(0);
  const features = (property.features as string[]) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 w-full bg-slate-100 sm:h-80">
          {images[activeImage] && (
            <Image src={images[activeImage]} alt={property.address} fill sizes="600px" className="object-cover" unoptimized />
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute left-3 top-3 flex gap-2">
            <StatusBadge status={property.availability} />
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
              Demo Property Data
            </span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-1.5 w-6 rounded-full transition ${i === activeImage ? "bg-white" : "bg-white/40"}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-semibold text-slate-900">
                {formatPrice(property.price, property.listingType)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {property.address}, {property.city}, {property.state} {property.zip} · {property.neighborhood}
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              {property.propertyType}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900">{property.bedrooms}</p>
              <p className="text-xs text-slate-500">Bedrooms</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{Number(property.bathrooms)}</p>
              <p className="text-xs text-slate-500">Bathrooms</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{property.sqft.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Sqft</p>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-900">About this property</h3>
            <p className="text-sm leading-relaxed text-slate-600">{property.description}</p>
          </div>

          {features.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Features</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((f) => (
                  <span key={f} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-1 text-sm font-semibold text-slate-900">Showing availability</h3>
            <p className="text-sm text-slate-600">{property.showingAvailability}</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className={`rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 ${onRequestShowing ? "flex-1" : "w-full"}`}
            >
              Close
            </button>
            {onRequestShowing && (
              <button
                onClick={() => {
                  onRequestShowing(property.id);
                  onClose();
                }}
                className="flex-1 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
              >
                Request Showing
              </button>
            )}
          </div>
          <p className="text-center text-[11px] text-slate-400">
            DEMO PROPERTY DATA — fictional listing created for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
