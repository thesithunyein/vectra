"use client";

import Link from "next/link";
import { Zap, Gauge, Clock, BadgeDollarSign, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition, StaggerChildren, StaggerItem } from "@/components/motion/PageTransition";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { kpis, ROI } from "@/lib/seed";
import { formatRm } from "@/lib/format";

export default function OverviewPage() {
  const { alerts, usingSample } = useStore();
  const { user } = useAuth();
  const open = alerts.filter((a) => a.status === "open");
  const plant = user?.plant ?? "My plant";

  return (
    <>
      <TopBar
        title="Overview"
        subtitle={
          usingSample
            ? `${plant} · live shift board`
            : `${plant} · live shift board for ${user?.name ?? "your team"}`
        }
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          {!usingSample && (
            <EmptyWorkspace
              title="Your plant workspace is empty"
              description="No devices or alerts yet. Set your plant identity in Settings, then connect machines or load example data."
            />
          )}

          <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StaggerItem>
              <KpiCard
                label="Energy Cost Today"
                value={usingSample ? kpis.energyCostToday : 0}
                prefix="$"
                delta={usingSample ? 8 : 0}
                deltaLabel={usingSample ? "% vs yesterday" : "awaiting telemetry"}
                positiveIsGood={false}
                icon={Zap}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Production Efficiency"
                value={usingSample ? kpis.productionEfficiency : 0}
                decimals={1}
                suffix="%"
                delta={usingSample ? 5.1 : 0}
                deltaLabel={usingSample ? "% this week" : "awaiting telemetry"}
                icon={Gauge}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Total Downtime"
                value={usingSample ? kpis.totalDowntimeHours : 0}
                decimals={1}
                suffix=" hrs"
                delta={usingSample ? 0.3 : 0}
                deltaLabel={usingSample ? "hrs vs average" : "no events"}
                positiveIsGood={false}
                icon={Clock}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Est. Downtime Cost"
                value={usingSample ? ROI.costTodayRm : 0}
                prefix="RM "
                delta={usingSample ? 18 : 0}
                deltaLabel={usingSample ? "min avg response" : "no events"}
                positiveIsGood={false}
                icon={BadgeDollarSign}
              />
            </StaggerItem>
          </StaggerChildren>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-medium">Open critical alerts</h3>
              <Link href="/alerts" className="text-[13px] text-[var(--accent)] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {open.length === 0 && (
                <p className="text-[13px] text-[var(--text-muted)]">No open alerts.</p>
              )}
              {open.map((a) => (
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
                    {a.driftDetected && (
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
                    {usingSample ? formatRm(ROI.costTodayRm) : "—"}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
