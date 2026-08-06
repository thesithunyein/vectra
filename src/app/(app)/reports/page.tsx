"use client";

import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { usePlantMetrics } from "@/lib/use-plant-metrics";
import { formatCurrency, formatRm } from "@/lib/format";

export default function ReportsPage() {
  const { records, maintenance, alerts, hasPlantData } = useStore();
  const { user } = useAuth();
  const metrics = usePlantMetrics();
  const closed = maintenance.filter((m) => m.status === "closed").length;
  const plant = user?.plant ?? "My plant";

  function exportCsv() {
    const rows = [
      ["Metric", "Value"],
      ["Plant", plant],
      ["Data source", hasPlantData ? "imported / live plant" : "empty"],
      ["Downtime hours", String(metrics.kpis.totalDowntimeHours)],
      ["Est cost (RM)", String(metrics.costTodayRm)],
      ["Efficiency %", String(metrics.kpis.productionEfficiency)],
      ["Energy cost USD", String(metrics.kpis.energyCostToday)],
      ["Devices", String(metrics.summary.deviceCount)],
      ["Open alerts", String(alerts.filter((a) => a.status !== "resolved").length)],
      ["Closed jobs", String(closed)],
      ["Signed records", String(records.length)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vectra-weekly-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <TopBar title="Reports" subtitle={`Weekly management pack · ${plant}`} />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <EmptyWorkspace
            when="no-plant"
            title="Report pack is empty"
            description="Import your plant in Settings. Export includes live metrics from your workspace."
          />

          {hasPlantData && (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110"
                >
                  Export weekly CSV
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Downtime", value: `${metrics.kpis.totalDowntimeHours} hrs` },
                  { label: "Est. cost", value: formatRm(metrics.costTodayRm) },
                  { label: "Efficiency", value: `${metrics.kpis.productionEfficiency}%` },
                  {
                    label: "Energy today",
                    value: formatCurrency(metrics.kpis.energyCostToday),
                  },
                  { label: "Devices", value: String(metrics.summary.deviceCount) },
                  { label: "Open alerts", value: String(metrics.summary.openAlerts) },
                  { label: "Closed jobs", value: String(closed) },
                  { label: "Signed records", value: String(records.length) },
                  { label: "Response avg", value: `${metrics.responseMinutes} min` },
                  { label: "Handoffs week", value: String(metrics.signedHandoffsWeek) },
                ].map((item) => (
                  <div key={item.label} className="card p-5">
                    <div className="text-[12px] text-[var(--text-muted)]">{item.label}</div>
                    <div className="mt-2 text-[24px] font-semibold tabular">{item.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
}
