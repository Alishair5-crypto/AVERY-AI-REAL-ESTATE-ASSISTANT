import Link from "next/link";
import { listProperties } from "@/lib/avery/tools";
import { PropertyCard } from "@/components/PropertyCard";
import { SERVICE_CITIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; listingType?: string }>;
}) {
  const { city, listingType } = await searchParams;
  const all = await listProperties();
  const filtered = all.filter((p) => (!city || p.city === city) && (!listingType || p.listingType === listingType));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Properties</h1>
          <p className="mt-1 text-sm text-slate-500">
            {all.length} listings in the demo inventory. <span className="font-medium text-slate-600">DEMO PROPERTY DATA</span> — fictional, for demonstration only.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/properties"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${!city && !listingType ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}
        >
          All
        </Link>
        {["For Sale", "For Rent"].map((lt) => (
          <Link
            key={lt}
            href={`/dashboard/properties?listingType=${encodeURIComponent(lt)}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${listingType === lt ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}
          >
            {lt}
          </Link>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-200" />
        {SERVICE_CITIES.map((c) => (
          <Link
            key={c}
            href={`/dashboard/properties?city=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${city === c ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
