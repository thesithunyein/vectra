import type { Alert, Device, MaintenanceEvent, SignedRecord } from "./types";

export type PlantData = {
  devices: Device[];
  alerts: Alert[];
  maintenance: MaintenanceEvent[];
  records: SignedRecord[];
};

export const EMPTY_PLANT: PlantData = {
  devices: [],
  alerts: [],
  maintenance: [],
  records: [],
};

function storageKey(userId: string) {
  return `vectra_plant_${userId}`;
}

export function loadPlantData(userId: string): PlantData {
  if (typeof window === "undefined") return { ...EMPTY_PLANT };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...EMPTY_PLANT };
    return { ...EMPTY_PLANT, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_PLANT };
  }
}

export function savePlantData(userId: string, data: PlantData): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}

export function clearPlantData(userId: string): void {
  localStorage.removeItem(storageKey(userId));
}

export function hasPlantData(data: PlantData): boolean {
  return (
    data.devices.length > 0 ||
    data.alerts.length > 0 ||
    data.maintenance.length > 0 ||
    data.records.length > 0
  );
}
