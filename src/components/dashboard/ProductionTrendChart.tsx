"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { productionTrend as defaultData } from "@/lib/seed";
import type { TrendPoint } from "@/lib/plant-metrics";
import { ChartTooltip } from "./ChartTooltip";

export function ProductionTrendChart({ data = defaultData }: { data?: TrendPoint[] }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-medium">Production & Efficiency Trend</h3>
          <p className="text-[12px] text-[var(--text-muted)]">Derived from your connected plant</p>
        </div>
        <select className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] outline-none">
          <option>Monthly</option>
        </select>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066ff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0066ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="production"
              name="Production"
              stroke="#0066ff"
              fill="url(#prodGrad)"
              strokeWidth={2}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
