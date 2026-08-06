"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { computePlantMetrics } from "@/lib/plant-metrics";
import {
  kpis as sampleKpis,
  ROI as sampleRoi,
  productionTrend as sampleTrend,
  costBreakdown as sampleCost,
  performanceRadar as sampleRadar,
  weekdayProduction as sampleWeek,
  downtimeBreakdown as sampleDowntime,
} from "@/lib/seed";

export function usePlantMetrics() {
  const { devices, alerts, maintenance, records, usingSample, hasPlantData } = useStore();

  const live = useMemo(
    () => computePlantMetrics({ devices, alerts, maintenance, records }),
    [devices, alerts, maintenance, records]
  );

  if (usingSample) {
    return {
      hasPlantData: true,
      usingSample: true,
      kpis: sampleKpis,
      costTodayRm: sampleRoi.costTodayRm,
      responseMinutes: sampleRoi.responseMinutes,
      signedHandoffsWeek: sampleRoi.signedHandoffsWeek,
      downtimeBreakdown: sampleDowntime,
      costBreakdown: sampleCost,
      performanceRadar: sampleRadar,
      productionTrend: sampleTrend,
      weekdayProduction: sampleWeek,
      summary: live.summary,
    };
  }

  return {
    hasPlantData,
    usingSample: false,
    ...live,
  };
}
