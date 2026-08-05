"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { downtimeBreakdown } from "@/lib/seed";

const COLORS = ["#0066ff", "#3b82f6", "#6366f1", "#94a3b8"];

export function DowntimeDonut() {
  const primary = downtimeBreakdown[0];
  return (
    <div className="card p-5">
      <h3 className="mb-2 text-[15px] font-medium">Downtime Analysis</h3>
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={downtimeBreakdown}
              dataKey="value"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
              animationDuration={600}
            >
              {downtimeBreakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[12px] text-[var(--text-muted)]">{primary.name}</div>
          <div className="text-[18px] font-semibold tabular">
            {primary.hours}h ({primary.value}%)
          </div>
        </div>
      </div>
    </div>
  );
}
