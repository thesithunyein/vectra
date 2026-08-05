export type DeviceStatus = "online" | "warning" | "offline";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type MaintenanceStatus = "open" | "closed";

export interface Device {
  id: string;
  name: string;
  line: string;
  status: DeviceStatus;
  lastSeen: string;
  alertCount: number;
}

export interface Alert {
  id: string;
  title: string;
  deviceId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  driftDetected: boolean;
  driftReason?: string;
  createdAt: string;
  assignedTo?: string;
}

export interface MaintenanceEvent {
  id: string;
  deviceId: string;
  title: string;
  reason: string;
  status: MaintenanceStatus;
  openedAt: string;
  closedAt?: string;
  closedBy?: string;
}

export interface SignedRecord {
  id: string;
  eventType: string;
  deviceName: string;
  sealedBy: string;
  sealedAt: string;
  integrityPassed: boolean;
  maintenanceId: string;
  integrityHash?: string;
  chainSignature?: string;
  chainExplorerUrl?: string;
  chainCluster?: string;
}

export interface KpiSnapshot {
  energyCostToday: number;
  energyDelta: number;
  productionEfficiency: number;
  efficiencyDelta: number;
  totalDowntimeHours: number;
  downtimeDelta: number;
  costSavingsMonth: number;
}
