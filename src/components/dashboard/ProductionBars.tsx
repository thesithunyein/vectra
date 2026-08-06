"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { weekdayProduction as defaultData } from "@/lib/seed";
import type { WeekBar } from "@/lib/plant-metrics";
import { ChartTooltip } from "./ChartTooltip";

export function ProductionBars({ data = defaultData }: { data?: WeekBar[] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-2 text-[15px] font-medium">Production Performance</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="planned" name="Planned" fill="#27272a" radius={[4, 4, 0, 0]} animationDuration={600} />
            <Bar dataKey="actual" name="Actual" fill="#0066ff" radius={[4, 4, 0, 0]} animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
