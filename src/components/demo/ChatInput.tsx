"use client";

import { useState } from "react";

export function ChatInput({
  onSend,
  onHumanHandoff,
  disabled,
  showMoreChip,
  onMoreProperties,
}: {
  onSend: (text: string) => void;
  onHumanHandoff: () => void;
  disabled?: boolean;
  showMoreChip?: boolean;
  onMoreProperties?: () => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          onClick={onHumanHandoff}
          disabled={disabled}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Speak to an agent
        </button>
        {showMoreChip && (
          <button
            onClick={onMoreProperties}
            disabled={disabled}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Show more options
          </button>
        )}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? "This conversation has been handed off to a human agent…" : "Type a message to Avery…"}
          className="max-h-28 flex-1 resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
