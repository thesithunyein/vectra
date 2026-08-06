"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import clsx from "clsx";

export default function AlertsPage() {
  const { alerts, devices, hasPlantData, acknowledgeAlert, assignAlert, resolveAlert } =
    useStore();
  const [briefs, setBriefs] = useState<Record<string, string>>({});
  const [briefSource, setBriefSource] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<Record<string, string>>({});

  async function generateBrief(alertId: string) {
    const a = alerts.find((x) => x.id === alertId);
    if (!a) return;
    const device = devices.find((d) => d.id === a.deviceId);
    setLoadingId(alertId);
    setBriefError((prev) => ({ ...prev, [alertId]: "" }));
    try {
      const res = await fetch("/api/alerts/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: a.title,
          severity: a.severity,
          status: a.status,
          driftDetected: a.driftDetected,
          driftReason: a.driftReason,
          deviceName: device?.name,
          line: device?.line,
        }),
      });
      const data = (await res.json()) as {
        brief?: string;
        source?: string;
        error?: string;
      };
      if (!res.ok || !data.brief) {
        setBriefError((prev) => ({
          ...prev,
          [alertId]: data.error || "Could not generate brief",
        }));
        return;
      }
      setBriefs((prev) => ({ ...prev, [alertId]: data.brief! }));
      setBriefSource((prev) => ({
        ...prev,
        [alertId]: data.source === "openai" ? "AI brief · OpenAI" : "Ops assist brief",
      }));
    } catch {
      setBriefError((prev) => ({
        ...prev,
        [alertId]: "Could not reach brief service",
      }));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <TopBar
        title="Alerts"
        subtitle="Act on faults. Briefs assist humans — people still decide."
      />
      <PageTransition>
        <div className="space-y-3 px-8 pb-10">
          {!hasPlantData && (
            <EmptyWorkspace
              title="No alerts"
              description="Import alerts with your plant data or connect telemetry to generate drift alerts."
            />
          )}
          {hasPlantData && alerts.length === 0 && (
            <p className="card p-5 text-[13px] text-[var(--text-secondary)]">
              No alerts in your plant data. Send a test telemetry signal from Settings or import an
              alerts sheet.
            </p>
          )}
          {alerts.map((a) => {
            const device = devices.find((d) => d.id === a.deviceId);
            return (
              <div key={a.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
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
                    {briefs[a.id] && (
                      <div className="mt-3 max-w-2xl rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--accent)]">
                          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {briefSource[a.id] || "AI brief"}
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-[var(--text-secondary)]">
                          {briefs[a.id]}
                        </pre>
                      </div>
                    )}
                    {briefError[a.id] && (
                      <p className="mt-2 text-[12px] text-red-400">{briefError[a.id]}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => generateBrief(a.id)}
                      disabled={loadingId === a.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-[12px] hover:bg-white/[0.04] disabled:opacity-60"
                    >
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {loadingId === a.id ? "Drafting…" : "AI brief"}
                    </button>
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
