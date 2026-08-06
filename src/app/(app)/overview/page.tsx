"use client";

import Link from "next/link";
import { Zap, Gauge, Clock, BadgeDollarSign, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition, StaggerChildren, StaggerItem } from "@/components/motion/PageTransition";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { usePlantMetrics } from "@/lib/use-plant-metrics";
import { formatRm } from "@/lib/format";

export default function OverviewPage() {
  const { alerts, hasPlantData } = useStore();
  const { user } = useAuth();
  const metrics = usePlantMetrics();
  const open = alerts.filter((a) => a.status === "open" || a.status === "acknowledged");
  const plant = user?.plant ?? "My plant";

  return (
    <>
      <TopBar
        title="Overview"
        subtitle={`${plant} · live shift board${hasPlantData ? "" : " · awaiting data"}`}
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <EmptyWorkspace when="no-plant" />

          {hasPlantData && (
            <div className="card flex flex-wrap items-center gap-4 p-4 text-[13px]">
              <span className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{metrics.summary.deviceCount}</strong>{" "}
                machines
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{metrics.summary.openAlerts}</strong> open
                alerts
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{metrics.summary.openMaintenance}</strong>{" "}
                maintenance jobs
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{metrics.summary.signedRecords}</strong>{" "}
                signed records
              </span>
            </div>
          )}

          {hasPlantData && (
            <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StaggerItem>
                <KpiCard
                  label="Energy Cost Today"
                  value={metrics.kpis.energyCostToday}
                  prefix="$"
                  delta={Math.abs(metrics.kpis.energyDelta)}
                  deltaLabel={`% vs yesterday`}
                  positiveIsGood={false}
                  icon={Zap}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Production Efficiency"
                  value={metrics.kpis.productionEfficiency}
                  decimals={1}
                  suffix="%"
                  delta={Math.abs(metrics.kpis.efficiencyDelta)}
                  deltaLabel="% this week"
                  icon={Gauge}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Total Downtime"
                  value={metrics.kpis.totalDowntimeHours}
                  decimals={1}
                  suffix=" hrs"
                  delta={metrics.kpis.downtimeDelta}
                  deltaLabel="hrs vs average"
                  positiveIsGood={false}
                  icon={Clock}
                />
              </StaggerItem>
              <StaggerItem>
                <KpiCard
                  label="Est. Downtime Cost"
                  value={metrics.costTodayRm}
                  prefix="RM "
                  delta={metrics.responseMinutes}
                  deltaLabel="min avg response"
                  positiveIsGood={false}
                  icon={BadgeDollarSign}
                />
              </StaggerItem>
            </StaggerChildren>
          )}

          {hasPlantData && (
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[15px] font-medium">Open critical alerts</h3>
                <Link href="/alerts" className="text-[13px] text-[var(--accent)] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {open.filter((a) => a.severity === "critical" || a.severity === "warning").length ===
                  0 && (
                  <p className="text-[13px] text-[var(--text-muted)]">No open alerts.</p>
                )}
                {open
                  .filter((a) => a.severity === "critical" || a.severity === "warning")
                  .slice(0, 5)
                  .map((a) => (
                    <Link
                      key={a.id}
                      href="/alerts"
                      className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition hover:border-[var(--border-strong)]"
                    >
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                        <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-medium">{a.title}</div>
                        {a.driftDetected && a.driftReason && (
                          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{a.driftReason}</p>
                        )}
                        <div className="mt-2 flex gap-2">
                          {a.driftDetected && (
                            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                              Early warning
                            </span>
                          )}
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] text-red-400 capitalize">
                            {a.severity}
                          </span>
                        </div>
                      </div>
                      <div className="text-[12px] text-[var(--text-muted)] tabular">
                        {formatRm(metrics.costTodayRm)}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
}
