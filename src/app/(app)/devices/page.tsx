"use client";

import { Activity, AlertTriangle, CircleOff } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { useStore } from "@/lib/store";
import clsx from "clsx";

export default function DevicesPage() {
  const { devices } = useStore();

  return (
    <>
      <TopBar title="Devices" subtitle="Line and machine status across Apex Precision." />
      <PageTransition>
        <div className="px-8 pb-10">
          <div className="card overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Machine</th>
                  <th className="px-5 py-3 font-medium">Line</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                  <th className="px-5 py-3 font-medium">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => {
                  const Icon =
                    d.status === "online" ? Activity : d.status === "warning" ? AlertTriangle : CircleOff;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-medium">{d.name}</td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{d.line}</td>
                      <td className="px-5 py-4">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] capitalize",
                            d.status === "online" && "bg-emerald-500/15 text-emerald-400",
                            d.status === "warning" && "bg-amber-500/15 text-amber-400",
                            d.status === "offline" && "bg-red-500/15 text-red-400"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{d.lastSeen}</td>
                      <td className="px-5 py-4 tabular">{d.alertCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
