"use client";

import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import clsx from "clsx";

export default function AlertsPage() {
  const { alerts, devices, usingSample, acknowledgeAlert, assignAlert, resolveAlert } =
    useStore();

  return (
    <>
      <TopBar title="Alerts" subtitle="Act on faults. Early warnings include baseline drift." />
      <PageTransition>
        <div className="space-y-3 px-8 pb-10">
          {!usingSample && alerts.length === 0 && (
            <EmptyWorkspace
              title="No alerts"
              description="Your inbox is clear. Alerts appear here when machines drift or go down."
            />
          )}
          {alerts.map((a) => {
            const device = devices.find((d) => d.id === a.deviceId);
            return (
              <div key={a.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-medium">{a.title}</h3>
                      {a.driftDetected && (
                        <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                          Early warning
                        </span>
                      )}
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-[11px] capitalize",
                          a.severity === "critical" && "bg-red-500/15 text-red-400",
                          a.severity === "warning" && "bg-amber-500/15 text-amber-400",
                          a.severity === "info" && "bg-white/10 text-[var(--text-secondary)]"
                        )}
                      >
                        {a.severity}
                      </span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] capitalize text-[var(--text-secondary)]">
                        {a.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                      {device?.name ?? "Unknown"} · {device?.line ?? "—"}
                      {a.assignedTo ? ` · Assigned to ${a.assignedTo}` : ""}
                    </p>
                    {a.driftReason && (
                      <p className="mt-2 max-w-2xl text-[13px] text-[var(--text-secondary)]">
                        {a.driftReason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "open" && (
                      <>
                        <button
                          type="button"
                          onClick={() => acknowledgeAlert(a.id)}
                          className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] hover:bg-white/[0.04]"
                        >
                          Acknowledge
                        </button>
                        <button
                          type="button"
                          onClick={() => assignAlert(a.id)}
                          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[12px] font-medium text-white hover:brightness-110"
                        >
                          Assign to me
                        </button>
                      </>
                    )}
                    {a.status !== "resolved" && (
                      <button
                        type="button"
                        onClick={() => resolveAlert(a.id)}
                        className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] hover:bg-white/[0.04]"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageTransition>
    </>
  );
}
