import Link from "next/link";
import type { Metadata } from "next";
import { DemoClient } from "@/components/demo/DemoClient";

export const metadata: Metadata = {
  title: "Avery Live Demo — AI Real Estate Assistant",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 font-display text-sm font-semibold text-white">
              A
            </span>
            <span className="font-display text-lg font-semibold text-slate-900">Avery</span>
            <span className="hidden text-xs text-slate-400 sm:inline">AI Real Estate Assistant</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:inline-block">
              Demo Environment
            </span>
            <Link href="/dashboard" className="rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-brand-800 sm:text-sm">
              Realtor Dashboard
            </Link>
          </div>
        </div>
      </header>
      <DemoClient />
    </div>
  );
}
