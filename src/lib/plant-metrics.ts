import type { PlantData } from "./plant-data";
import type { KpiSnapshot } from "./types";

export type DowntimeSlice = { name: string; value: number; hours: number };
export type CostSlice = { name: string; value: number; percent: number; color: string };
export type RadarSlice = { metric: string; value: number };
export type TrendPoint = { month: string; production: number; efficiency: number };
export type WeekBar = { day: string; planned: number; actual: number };

export type PlantMetrics = {
  kpis: KpiSnapshot;
  costTodayRm: number;
  responseMinutes: number;
  signedHandoffsWeek: number;
  downtimeBreakdown: DowntimeSlice[];
  costBreakdown: CostSlice[];
  performanceRadar: RadarSlice[];
  productionTrend: TrendPoint[];
  weekdayProduction: WeekBar[];
  summary: {
    deviceCount: number;
    onlineCount: number;
    openAlerts: number;
    openMaintenance: number;
    closedMaintenance: number;
    signedRecords: number;
  };
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function computePlantMetrics(data: PlantData): PlantMetrics {
  const { devices, alerts, maintenance, records } = data;

  const online = devices.filter((d) => d.status === "online").length;
  const warning = devices.filter((d) => d.status === "warning").length;
  const offline = devices.filter((d) => d.status === "offline").length;
  const openAlerts = alerts.filter((a) => a.status === "open" || a.status === "acknowledged");
  const criticalOpen = openAlerts.filter((a) => a.severity === "critical").length;
  const openMaint = maintenance.filter((m) => m.status === "open");
  const closedMaint = maintenance.filter((m) => m.status === "closed");

  const deviceCount = devices.length || 1;
  const uptimeScore = ((online + warning * 0.65) / deviceCount) * 100;
  const productionEfficiency = clamp(
    Math.round(uptimeScore - openAlerts.length * 2.5 - criticalOpen * 4),
    58,
    99
  );

  const totalDowntimeHours =
    Math.round((openMaint.length * 1.4 + closedMaint.length * 0.6 + criticalOpen * 0.5) * 10) /
    10;

  const energyCostToday = Math.round(620 + deviceCount * 210 + openAlerts.length * 95 + offline * 140);
  const costTodayRm = Math.round(totalDowntimeHours * 8200 + openAlerts.length * 950);
  const costSavingsMonth = Math.round(closedMaint.length * 2400 + records.length * 1800);

  const kpis: KpiSnapshot = {
    energyCostToday,
    energyDelta: openAlerts.length > 2 ? 6 : -4,
    productionEfficiency,
    efficiencyDelta: openAlerts.length === 0 ? 3.2 : -1.8,
    totalDowntimeHours,
    downtimeDelta: openMaint.length > 0 ? 0.4 : -0.2,
    costSavingsMonth,
  };

  const reasonCounts = new Map<string, number>();
  for (const job of maintenance) {
    const key = job.reason?.trim() || "Other";
    reasonCounts.set(key, (reasonCounts.get(key) ?? 0) + 1);
  }
  if (reasonCounts.size === 0 && openAlerts.length > 0) {
    reasonCounts.set("Drift / alert", openAlerts.length);
  }

  const downtimeEntries = [...reasonCounts.entries()].map(([name, count]) => ({
    name,
    hours: count,
    value: count,
  }));
  const downtimeTotal = downtimeEntries.reduce((s, d) => s + d.value, 0) || 1;
  const downtimeBreakdown: DowntimeSlice[] = downtimeEntries.map((d) => ({
    name: d.name,
    hours: d.hours,
    value: Math.round((d.value / downtimeTotal) * 100),
  }));

  const energyWeight = energyCostToday;
  const laborWeight = Math.round(deviceCount * 4200 + openMaint.length * 800);
  const materialsWeight = Math.round(deviceCount * 1800 + warning * 400);
  const costTotal = energyWeight + laborWeight + materialsWeight || 1;
  const costBreakdown: CostSlice[] = [
    {
      name: "Energy",
      value: energyWeight,
      percent: Math.round((energyWeight / costTotal) * 100),
      color: "#f59e0b",
    },
    {
      name: "Labor",
      value: laborWeight,
      percent: Math.round((laborWeight / costTotal) * 100),
      color: "#0066ff",
    },
    {
      name: "Materials",
      value: materialsWeight,
      percent: Math.round((materialsWeight / costTotal) * 100),
      color: "#8b5cf6",
    },
  ];

  const performanceRadar: RadarSlice[] = [
    { metric: "Quality", value: clamp(productionEfficiency - 2, 55, 99) },
    { metric: "Reliability", value: clamp(Math.round(uptimeScore), 55, 99) },
    { metric: "Uptime", value: clamp(Math.round((online / deviceCount) * 100), 50, 99) },
    { metric: "Safety", value: clamp(94 - criticalOpen * 5, 60, 99) },
    { metric: "Efficiency", value: productionEfficiency },
    { metric: "Security", value: clamp(88 + records.length * 2, 70, 99) },
  ];

  const baseProduction = deviceCount * 5200;
  const productionTrend: TrendPoint[] = MONTHS.map((month, i) => {
    const drift = (MONTHS.length - i) * openAlerts.length * 120;
    return {
      month,
      production: Math.round(baseProduction + i * 380 - drift),
      efficiency: clamp(productionEfficiency - (MONTHS.length - 1 - i), 58, 99),
    };
  });

  const lines = [...new Set(devices.map((d) => d.line))];
  const weekdayProduction: WeekBar[] = ["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
    const planned = lines.length * 520 || deviceCount * 130;
    const linePenalty = lines.reduce((sum, line) => {
      const onLine = devices.filter((d) => d.line === line);
      const warn = onLine.filter((d) => d.status === "warning").length;
      return sum + warn * 18;
    }, 0);
    const actual = Math.round(planned - linePenalty - i * 8 + online * 4);
    return { day, planned, actual: clamp(actual, Math.round(planned * 0.55), planned) };
  });

  return {
    kpis,
    costTodayRm,
    responseMinutes: openAlerts.length > 0 ? 14 + criticalOpen * 4 : 22,
    signedHandoffsWeek: records.length + closedMaint.length,
    downtimeBreakdown:
      downtimeBreakdown.length > 0
        ? downtimeBreakdown
        : [{ name: "No downtime logged", value: 100, hours: 0 }],
    costBreakdown,
    performanceRadar,
    productionTrend,
    weekdayProduction,
    summary: {
      deviceCount: devices.length,
      onlineCount: online,
      openAlerts: openAlerts.length,
      openMaintenance: openMaint.length,
      closedMaintenance: closedMaint.length,
      signedRecords: records.length,
    },
  };
}
