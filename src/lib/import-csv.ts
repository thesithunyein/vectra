import { parseCsv, rowsToObjects } from "./csv";
import type { Alert, Device, MaintenanceEvent } from "./types";

export type ImportPreview = {
  devices: Device[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
  errors: string[];
};

const DEVICE_STATUSES = new Set(["online", "warning", "offline"]);
const ALERT_SEVERITIES = new Set(["critical", "warning", "info"]);
const ALERT_STATUSES = new Set(["open", "acknowledged", "resolved"]);
const MAINT_STATUSES = new Set(["open", "closed"]);

export const DEVICE_TEMPLATE = `id,name,line,status,last_seen
SMT-01,SMT Pick & Place,Line A,online,2 min ago
Reflow-01,Reflow Oven,Line A,warning,5 min ago
AOI-01,AOI Inspector,Line B,online,1 min ago`;

export const ALERTS_TEMPLATE = `id,title,device_id,severity,status,drift_detected,drift_reason,created_at,assigned_to
alert-1,False reject rate above limit,AOI-01,critical,open,true,Efficiency below 14-day baseline,2026-08-06T08:00:00Z,
alert-2,Reflow zone temperature drift,Reflow-01,warning,open,false,,2026-08-06T07:45:00Z,`;

export const MAINTENANCE_TEMPLATE = `id,device_id,title,reason,status,opened_at
maint-1,Reflow-01,Reflow thermocouple calibration,DRIFT,open,2026-08-06T07:30:00Z
maint-2,AOI-01,Lens cleaning and alignment,PM,open,2026-08-05T14:00:00Z`;

function slugId(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed || fallback;
}

function parseBool(value: string): boolean {
  const v = value.toLowerCase();
  return v === "true" || v === "yes" || v === "1";
}

export function parseDevicesCsv(text: string): { devices: Device[]; errors: string[] } {
  const rows = parseCsv(text);
  const objects = rowsToObjects(rows);
  const errors: string[] = [];
  const devices: Device[] = [];
  const seenIds = new Set<string>();

  objects.forEach((row, index) => {
    const lineNum = index + 2;
    const id = slugId(row.id || row.name, `device-${index + 1}`);
    if (seenIds.has(id)) {
      errors.push(`Row ${lineNum}: duplicate device id "${id}"`);
      return;
    }
    seenIds.add(id);

    const name = row.name?.trim();
    if (!name) {
      errors.push(`Row ${lineNum}: name is required`);
      return;
    }

    const status = (row.status?.toLowerCase() || "online") as Device["status"];
    if (!DEVICE_STATUSES.has(status)) {
      errors.push(`Row ${lineNum}: status must be online, warning, or offline`);
      return;
    }

    devices.push({
      id,
      name,
      line: row.line?.trim() || "Unassigned",
      status,
      lastSeen: row.last_seen?.trim() || "Unknown",
      alertCount: 0,
    });
  });

  return { devices, errors };
}

export function parseAlertsCsv(
  text: string,
  deviceIds: Set<string>
): { alerts: Alert[]; errors: string[] } {
  const rows = parseCsv(text);
  const objects = rowsToObjects(rows);
  const errors: string[] = [];
  const alerts: Alert[] = [];

  objects.forEach((row, index) => {
    const lineNum = index + 2;
    const id = slugId(row.id, `alert-${index + 1}`);
    const title = row.title?.trim();
    if (!title) {
      errors.push(`Row ${lineNum}: title is required`);
      return;
    }

    const deviceId = row.device_id?.trim();
    if (!deviceId) {
      errors.push(`Row ${lineNum}: device_id is required`);
      return;
    }
    if (deviceIds.size > 0 && !deviceIds.has(deviceId)) {
      errors.push(`Row ${lineNum}: device_id "${deviceId}" not found in devices list`);
      return;
    }

    const severity = (row.severity?.toLowerCase() || "warning") as Alert["severity"];
    if (!ALERT_SEVERITIES.has(severity)) {
      errors.push(`Row ${lineNum}: severity must be critical, warning, or info`);
      return;
    }

    const status = (row.status?.toLowerCase() || "open") as Alert["status"];
    if (!ALERT_STATUSES.has(status)) {
      errors.push(`Row ${lineNum}: status must be open, acknowledged, or resolved`);
      return;
    }

    alerts.push({
      id,
      title,
      deviceId,
      severity,
      status,
      driftDetected: parseBool(row.drift_detected || "false"),
      driftReason: row.drift_reason?.trim() || undefined,
      createdAt: row.created_at?.trim() || new Date().toISOString(),
      assignedTo: row.assigned_to?.trim() || undefined,
    });
  });

  return { alerts, errors };
}

export function parseMaintenanceCsv(
  text: string,
  deviceIds: Set<string>
): { maintenance: MaintenanceEvent[]; errors: string[] } {
  const rows = parseCsv(text);
  const objects = rowsToObjects(rows);
  const errors: string[] = [];
  const maintenance: MaintenanceEvent[] = [];

  objects.forEach((row, index) => {
    const lineNum = index + 2;
    const id = slugId(row.id, `maint-${index + 1}`);
    const title = row.title?.trim();
    if (!title) {
      errors.push(`Row ${lineNum}: title is required`);
      return;
    }

    const deviceId = row.device_id?.trim();
    if (!deviceId) {
      errors.push(`Row ${lineNum}: device_id is required`);
      return;
    }
    if (deviceIds.size > 0 && !deviceIds.has(deviceId)) {
      errors.push(`Row ${lineNum}: device_id "${deviceId}" not found in devices list`);
      return;
    }

    const status = (row.status?.toLowerCase() || "open") as MaintenanceEvent["status"];
    if (!MAINT_STATUSES.has(status)) {
      errors.push(`Row ${lineNum}: status must be open or closed`);
      return;
    }

    maintenance.push({
      id,
      deviceId,
      title,
      reason: row.reason?.trim() || "OTHER",
      status,
      openedAt: row.opened_at?.trim() || new Date().toISOString(),
    });
  });

  return { maintenance, errors };
}

export function buildImportPreview(
  devicesCsv: string,
  alertsCsv?: string,
  maintenanceCsv?: string
): ImportPreview {
  const { devices, errors: deviceErrors } = parseDevicesCsv(devicesCsv);
  const deviceIds = new Set(devices.map((d) => d.id));

  const alertResult = alertsCsv?.trim()
    ? parseAlertsCsv(alertsCsv, deviceIds)
    : { alerts: [] as Alert[], errors: [] as string[] };

  const maintResult = maintenanceCsv?.trim()
    ? parseMaintenanceCsv(maintenanceCsv, deviceIds)
    : { maintenance: [] as MaintenanceEvent[], errors: [] as string[] };

  // Sync alert counts on devices
  const alertCounts = new Map<string, number>();
  for (const alert of alertResult.alerts) {
    if (alert.status !== "resolved") {
      alertCounts.set(alert.deviceId, (alertCounts.get(alert.deviceId) ?? 0) + 1);
    }
  }
  const devicesWithCounts = devices.map((d) => ({
    ...d,
    alertCount: alertCounts.get(d.id) ?? 0,
  }));

  return {
    devices: devicesWithCounts,
    alerts: alertResult.alerts,
    maintenance: maintResult.maintenance,
    errors: [...deviceErrors, ...alertResult.errors, ...maintResult.errors],
  };
}
