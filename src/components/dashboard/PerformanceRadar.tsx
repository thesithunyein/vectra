"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { performanceRadar as defaultData } from "@/lib/seed";
import type { RadarSlice } from "@/lib/plant-metrics";

export function PerformanceRadar({ data = defaultData }: { data?: RadarSlice[] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-2 text-[15px] font-medium">Overall Performance</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <Radar
              dataKey="value"
              stroke="#0066ff"
              fill="#0066ff"
              fillOpacity={0.15}
              strokeWidth={2}
              animationDuration={600}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
