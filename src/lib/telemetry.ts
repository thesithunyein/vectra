import type { Alert, AlertSeverity, Device, DeviceStatus } from "./types";
import type { PlantData } from "./plant-data";

export type TelemetryPayload = {
  deviceId: string;
  metric: string;
  value: number;
  threshold?: number;
  unit?: string;
};

function severityFor(value: number, threshold: number): AlertSeverity {
  const ratio = value / threshold;
  if (ratio >= 1.35) return "critical";
  if (ratio >= 1.1) return "warning";
  return "info";
}

function deviceStatusFor(severity: AlertSeverity): DeviceStatus {
  if (severity === "critical") return "offline";
  if (severity === "warning") return "warning";
  return "online";
}

function formatMetric(metric: string) {
  return metric.replace(/_/g, " ");
}

export function applyTelemetrySignal(
  plant: PlantData,
  payload: TelemetryPayload
): { plant: PlantData; alertCreated: boolean; alertId?: string } {
  const threshold = payload.threshold ?? 3;
  const deviceIndex = plant.devices.findIndex((d) => d.id === payload.deviceId);

  if (deviceIndex === -1) {
    return { plant, alertCreated: false };
  }

  const devices = [...plant.devices];
  const device = { ...devices[deviceIndex] };
  const now = new Date().toISOString();
  const breached = payload.value >= threshold;
  const severity = severityFor(payload.value, threshold);

  device.lastSeen = "Just now";
  device.status = breached ? deviceStatusFor(severity) : "online";

  let alerts = [...plant.alerts];
  let alertCreated = false;
  let alertId: string | undefined;

  if (breached) {
    alertId = `tel-${payload.deviceId}-${Date.now()}`;
    const driftReason = `${formatMetric(payload.metric)} at ${payload.value}${payload.unit ? ` ${payload.unit}` : ""} vs baseline ${threshold}.`;
    const alert: Alert = {
      id: alertId,
      title: `${device.name} ${formatMetric(payload.metric)} above limit`,
      deviceId: device.id,
      severity,
      status: "open",
      driftDetected: true,
      driftReason,
      createdAt: now,
    };
    alerts = [alert, ...alerts];
    alertCreated = true;
  }

  const openAlerts = alerts.filter(
    (a) => a.deviceId === device.id && a.status !== "resolved"
  ).length;
  device.alertCount = openAlerts;
  devices[deviceIndex] = device;

  return {
    plant: { ...plant, devices, alerts },
    alertCreated,
    alertId,
  };
}

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  return `${Math.floor(diff / 3_600_000)} hr ago`;
}

export function refreshDeviceTimes(plant: PlantData): PlantData {
  return {
    ...plant,
    devices: plant.devices.map((d) =>
      d.lastSeen === "Just now" ? d : { ...d, lastSeen: d.lastSeen || "Unknown" }
    ),
  };
}
