"use client";

import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { kpis, ROI } from "@/lib/seed";
import { formatCurrency, formatRm } from "@/lib/format";

export default function ReportsPage() {
  const { records, maintenance, alerts, usingSample } = useStore();
  const { user } = useAuth();
  const closed = maintenance.filter((m) => m.status === "closed").length;
  const plant = user?.plant ?? "My plant";

  function exportCsv() {
    const rows = [
      ["Metric", "Value"],
      ["Plant", plant],
      ["Sample mode", usingSample ? "yes" : "no"],
      [
        "Downtime hours",
        String(usingSample ? kpis.totalDowntimeHours : 0),
      ],
      ["Est cost (RM)", String(usingSample ? ROI.costTodayRm : 0)],
      ["Efficiency %", String(usingSample ? kpis.productionEfficiency : 0)],
      ["Energy cost USD", String(usingSample ? kpis.energyCostToday : 0)],
      ["Closed jobs", String(closed)],
      ["Signed records", String(records.length)],
      ["Open alerts", String(alerts.filter((a) => a.status === "open").length)],
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
          {!usingSample && (
            <EmptyWorkspace
              title="Report pack is empty"
              description="Export includes live metrics from your workspace. Load example data if you need a filled weekly pack."
            />
          )}
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
              {
                label: "Downtime",
                value: usingSample ? `${kpis.totalDowntimeHours} hrs` : "0 hrs",
              },
              {
                label: "Est. cost",
                value: usingSample ? formatRm(ROI.costTodayRm) : formatRm(0),
              },
              {
                label: "Efficiency",
                value: usingSample ? `${kpis.productionEfficiency}%` : "0%",
              },
              {
                label: "Energy today",
                value: usingSample
                  ? formatCurrency(kpis.energyCostToday)
                  : formatCurrency(0),
              },
              { label: "Closed jobs", value: String(closed) },
              { label: "Signed records", value: String(records.length) },
              {
                label: "Response avg",
                value: usingSample ? `${ROI.responseMinutes} min` : "—",
              },
              {
                label: "Handoffs week",
                value: usingSample ? String(ROI.signedHandoffsWeek) : String(records.length),
              },
            ].map((item) => (
              <div key={item.label} className="card p-5">
                <div className="text-[12px] text-[var(--text-muted)]">{item.label}</div>
                <div className="mt-2 text-[24px] font-semibold tabular">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    </>
  );
}
