"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";

export default function MaintenancePage() {
  const { maintenance, devices, usingSample, closeMaintenance } = useStore();
  const { user } = useAuth();
  const [sealingId, setSealingId] = useState<string | null>(null);

  async function onClose(id: string) {
    setSealingId(id);
    try {
      await closeMaintenance(id, user?.name);
    } finally {
      setSealingId(null);
    }
  }

  return (
    <>
      <TopBar
        title="Maintenance"
        subtitle="Close work with reason codes. Seals a signed record and attests the hash on Solana."
      />
      <PageTransition>
        <div className="space-y-3 px-8 pb-10">
          {!usingSample && maintenance.length === 0 && (
            <EmptyWorkspace
              title="No maintenance jobs"
              description="Open jobs appear when you assign alerts or schedule work."
            />
          )}
          {maintenance.map((m) => {
            const device = devices.find((d) => d.id === m.deviceId);
            return (
              <div
                key={m.id}
                className="card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <h3 className="text-[15px] font-medium">{m.title}</h3>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                    {device?.name ?? "Unknown"} · Reason: {m.reason}
                  </p>
                  <span
                    className={clsx(
                      "mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] capitalize",
                      m.status === "open"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-emerald-500/15 text-emerald-400"
                    )}
                  >
                    {m.status}
                  </span>
                </div>
                {m.status === "open" ? (
                  <button
                    type="button"
                    disabled={sealingId === m.id}
                    onClick={() => onClose(m.id)}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:opacity-60"
                  >
                    {sealingId === m.id ? "Sealing & attesting…" : "Close & sign record"}
                  </button>
                ) : (
                  <span className="text-[13px] text-[var(--text-muted)]">
                    Closed by {m.closedBy}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </PageTransition>
    </>
  );
}
