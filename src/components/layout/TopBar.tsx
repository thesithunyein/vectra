"use client";

import { Bell, Search, Settings } from "lucide-react";
import { useStore } from "@/lib/store";

export function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  const { alerts } = useStore();
  const unread = alerts.filter((a) => a.status === "open").length;

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-8 py-3">
        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Search devices, alerts..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] py-2 pl-10 pr-12 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            ⌘K
          </kbd>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/[0.04]">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
            )}
          </button>
          <button className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/[0.04]">
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[12px] font-medium text-[var(--accent)] ring-1 ring-[var(--border-strong)]">
            FA
          </div>
        </div>
      </div>
      <div className="px-8 pb-5 pt-2">
        <h1 className="text-[28px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{subtitle}</p>
      </div>
    </div>
  );
}
