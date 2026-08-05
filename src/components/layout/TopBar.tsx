"use client";

import { Bell, Search, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { PLANT_DEFAULTS } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  const { alerts } = useStore();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const unread = alerts.filter((a) => a.status === "open").length;

  if (!user) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-[var(--border-subtle)] surface-blur">
      <div className="flex items-center gap-4 px-8 py-3">
        <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[12px] lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          <span className="text-[var(--text-secondary)]">{user.plantSite}</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-muted)]">{user.shift}</span>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Search machines, alerts, records..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] py-2 pl-10 pr-12 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            ⌘K
          </kbd>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button className="relative rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
            )}
          </button>
          <button className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-1 flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] py-1 pl-1 pr-2 hover:border-[var(--border-strong)]"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[12px] font-medium text-[var(--accent)]">
                  {user.initials}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <div className="text-[12px] font-medium leading-tight">{user.name}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{user.role}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] p-3 shadow-2xl">
                <div className="text-[13px] font-medium">{user.name}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">{user.role}</div>
                <div className="mt-1 font-mono text-[11px] text-[var(--accent)]">{user.email}</div>
                <div className="mt-2 border-t border-[var(--border-subtle)] pt-2 text-[12px] text-[var(--text-muted)]">
                  {user.plant} · {user.plantSite}
                </div>
                <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Default plant template: {PLANT_DEFAULTS.plant}
                </div>
                <button
                  onClick={() => signOut()}
                  className="mt-3 w-full rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-[12px] hover:bg-[var(--bg-hover)]"
                >
                  Sign out
                </button>
              </div>
            )}
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
