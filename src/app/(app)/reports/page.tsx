"use client";

import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { useStore } from "@/lib/store";
import { kpis, ROI, PLANT_NAME } from "@/lib/seed";
import { formatCurrency, formatRm } from "@/lib/format";

export default function ReportsPage() {
  const { records, maintenance, alerts } = useStore();
  const closed = maintenance.filter((m) => m.status === "closed").length;

  function exportCsv() {
    const rows = [
      ["Metric", "Value"],
      ["Plant", PLANT_NAME],
      ["Downtime hours", String(kpis.totalDowntimeHours)],
      ["Est cost (RM)", String(ROI.costTodayRm)],
      ["Efficiency %", String(kpis.productionEfficiency)],
      ["Energy cost USD", String(kpis.energyCostToday)],
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
      <TopBar title="Reports" subtitle="Weekly management pack for Apex Precision." />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <div className="flex justify-end">
            <button
              onClick={exportCsv}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110"
            >
              Export weekly CSV
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Downtime", value: `${kpis.totalDowntimeHours} hrs` },
              { label: "Est. cost", value: formatRm(ROI.costTodayRm) },
              { label: "Efficiency", value: `${kpis.productionEfficiency}%` },
              { label: "Energy today", value: formatCurrency(kpis.energyCostToday) },
              { label: "Closed jobs", value: String(closed) },
              { label: "Signed records", value: String(records.length) },
              { label: "Response avg", value: `${ROI.responseMinutes} min` },
              { label: "Handoffs week", value: String(ROI.signedHandoffsWeek) },
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
