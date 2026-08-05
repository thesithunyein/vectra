import type {
  Alert,
  Device,
  KpiSnapshot,
  MaintenanceEvent,
  SignedRecord,
} from "./types";

export const PLANT_NAME = "Apex Precision";
export const PLANT_LOCATION = "Shah Alam, Selangor";

export const kpis: KpiSnapshot = {
  energyCostToday: 1847,
  energyDelta: -8,
  productionEfficiency: 94.2,
  efficiencyDelta: 5.1,
  totalDowntimeHours: 2.4,
  downtimeDelta: 0.3,
  costSavingsMonth: 12400,
};

export const productionTrend = [
  { month: "Jan", production: 28500, efficiency: 88 },
  { month: "Feb", production: 30100, efficiency: 90 },
  { month: "Mar", production: 33800, efficiency: 92 },
  { month: "Apr", production: 31200, efficiency: 91 },
  { month: "May", production: 32900, efficiency: 93 },
  { month: "Jun", production: 34100, efficiency: 94 },
];

export const costBreakdown = [
  { name: "Energy", value: 52400, percent: 42, color: "#f59e0b" },
  { name: "Labor", value: 38200, percent: 31, color: "#3b82f6" },
  { name: "Materials", value: 21500, percent: 17, color: "#8b5cf6" },
];

export const performanceRadar = [
  { metric: "Quality", value: 96 },
  { metric: "Reliability", value: 89 },
  { metric: "Uptime", value: 98 },
  { metric: "Safety", value: 92 },
  { metric: "Efficiency", value: 90 },
  { metric: "Security", value: 94 },
];

export const weekdayProduction = [
  { day: "M", planned: 520, actual: 480 },
  { day: "T", planned: 520, actual: 510 },
  { day: "W", planned: 520, actual: 495 },
  { day: "T", planned: 520, actual: 530 },
  { day: "F", planned: 520, actual: 515 },
  { day: "S", planned: 400, actual: 380 },
  { day: "S", planned: 400, actual: 390 },
];

export const downtimeBreakdown = [
  { name: "Scheduled Maintenance", value: 35, hours: 35 },
  { name: "Breakdown", value: 28, hours: 28 },
  { name: "Changeover", value: 22, hours: 22 },
  { name: "Material Wait", value: 15, hours: 15 },
];

export const initialDevices: Device[] = [
  { id: "d1", name: "SMT-01", line: "Line A", status: "online", lastSeen: "2 min ago", alertCount: 0 },
  { id: "d2", name: "Reflow-01", line: "Line A", status: "warning", lastSeen: "5 min ago", alertCount: 1 },
  { id: "d3", name: "AOI-01", line: "Line B", status: "warning", lastSeen: "1 min ago", alertCount: 1 },
  { id: "d4", name: "SMT-02", line: "Line B", status: "online", lastSeen: "3 min ago", alertCount: 0 },
  { id: "d5", name: "Conveyor-B", line: "Line B", status: "online", lastSeen: "4 min ago", alertCount: 0 },
  { id: "d6", name: "Pack-01", line: "Pack", status: "online", lastSeen: "2 min ago", alertCount: 0 },
];

export const initialAlerts: Alert[] = [
  {
    id: "a1",
    title: "AOI-01 false reject rate above limit",
    deviceId: "d3",
    severity: "critical",
    status: "open",
    driftDetected: true,
    driftReason: "Efficiency 6.2 pts below 14-day baseline on Line B. Linked to AOI-01.",
    createdAt: "2026-08-05T08:42:00",
    assignedTo: undefined,
  },
  {
    id: "a2",
    title: "Reflow-01 temp band drift",
    deviceId: "d2",
    severity: "warning",
    status: "open",
    driftDetected: true,
    driftReason: "Energy cost 12% above baseline during last 6 hours on Line A.",
    createdAt: "2026-08-05T07:15:00",
  },
  {
    id: "a3",
    title: "Pack-01 conveyor speed variance",
    deviceId: "d6",
    severity: "info",
    status: "acknowledged",
    driftDetected: false,
    createdAt: "2026-08-04T16:30:00",
    assignedTo: "Raj Kumar",
  },
];

export const initialMaintenance: MaintenanceEvent[] = [
  {
    id: "m1",
    deviceId: "d3",
    title: "AOI-01 calibration check",
    reason: "Breakdown",
    status: "open",
    openedAt: "2026-08-05T09:00:00",
  },
  {
    id: "m2",
    deviceId: "d2",
    title: "Reflow-01 heater inspection",
    reason: "Planned PM",
    status: "open",
    openedAt: "2026-08-05T07:30:00",
  },
];

export const initialRecords: SignedRecord[] = [
  {
    id: "REC-10480",
    eventType: "Maintenance closed",
    deviceName: "SMT-01",
    sealedBy: "Raj Kumar",
    sealedAt: "2026-08-04T22:15:00",
    integrityPassed: true,
    maintenanceId: "m0",
  },
];

export const ROI = {
  downtimeHours: 2.4,
  costTodayRm: 5760,
  responseMinutes: 18,
  signedHandoffsWeek: 12,
};

export const REASON_CODES = [
  "Planned PM",
  "Changeover",
  "Breakdown",
  "Material wait",
  "Quality hold",
];
