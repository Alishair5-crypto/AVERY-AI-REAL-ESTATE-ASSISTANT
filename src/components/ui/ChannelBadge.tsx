const CHANNEL_STYLES: Record<string, string> = {
  Instagram: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  "Facebook Messenger": "bg-blue-50 text-blue-700 border-blue-200",
  WhatsApp: "bg-green-50 text-green-700 border-green-200",
  "Website Chat": "bg-brand-50 text-brand-700 border-brand-200",
  "Lead Form": "bg-slate-100 text-slate-700 border-slate-200",
};

export function ChannelBadge({ channel }: { channel: string }) {
  const cls = CHANNEL_STYLES[channel] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {channel}
      <span className="text-[9px] uppercase tracking-wide text-slate-400">demo</span>
    </span>
  );
}
