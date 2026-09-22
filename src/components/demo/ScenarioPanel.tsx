"use client";

const SCENARIOS: { key: string; label: string; description: string }[] = [
  { key: "buyer", label: "Buyer Demo", description: "3-bed house in Houston, under $400k" },
  { key: "renter", label: "Renter Demo", description: "2-bed apartment near downtown Houston" },
  { key: "seller", label: "Seller Demo", description: "Wants to sell a Houston property" },
  { key: "abandoned", label: "Abandoned Lead", description: "Lead goes quiet mid-qualification" },
  { key: "handoff", label: "Human Handoff", description: "Customer asks for a real agent" },
];

export function ScenarioPanel({
  onRun,
  onReset,
  loading,
}: {
  onRun: (key: string) => void;
  onReset: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-slate-900">Demo Control Panel</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Sales Demo
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Jump straight into a scripted scenario, or type your own message in the chat.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            disabled={loading}
            onClick={() => onRun(s.key)}
            className="rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-50"
          >
            <p className="text-sm font-semibold text-slate-800">{s.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
          </button>
        ))}
      </div>
      <button
        onClick={onReset}
        disabled={loading}
        className="mt-3 w-full rounded-xl border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        Reset Demo
      </button>
    </div>
  );
}
