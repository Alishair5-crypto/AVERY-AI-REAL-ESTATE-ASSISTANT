import Link from "next/link";
import type { ReactNode } from "react";
import { ensureSeeded } from "@/lib/demo/seed";
import { DashboardNav, MobileNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 font-display text-sm font-semibold text-white">
              A
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-slate-900">Avery Dashboard</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Lonestar Realty Group</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Demo Mode Active</span>
            <Link href="/demo" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:text-sm">
              Open Avery Chat
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardNav />
        <main className="min-w-0 flex-1 pb-16">
          <MobileNav />
          {children}
        </main>
      </div>
    </div>
  );
}
