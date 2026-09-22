"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/conversations", label: "Conversations" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/properties", label: "Properties" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/followups", label: "Follow-ups" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden w-52 shrink-0 lg:block">
      <ul className="sticky top-20 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              active ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 text-slate-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
