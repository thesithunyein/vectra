import type { PlantData } from "./plant-data";

export async function fetchPlantFromCloud(): Promise<PlantData | null> {
  try {
    const res = await fetch("/api/plant", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as PlantData & { ok?: boolean };
    return {
      devices: data.devices ?? [],
      alerts: data.alerts ?? [],
      maintenance: data.maintenance ?? [],
      records: data.records ?? [],
    };
  } catch {
    return null;
  }
}

export async function savePlantToCloud(plant: PlantData): Promise<boolean> {
  try {
    const res = await fetch("/api/plant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plant),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clearPlantCloud(): Promise<boolean> {
  try {
    const res = await fetch("/api/plant", { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchTelemetryApiKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/plant/api-key", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { apiKey?: string };
    return data.apiKey ?? null;
  } catch {
    return null;
  }
}

export async function rotateTelemetryApiKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/plant/api-key", { method: "POST" });
    if (!res.ok) return null;
    const data = (await res.json()) as { apiKey?: string };
    return data.apiKey ?? null;
  } catch {
    return null;
  }
}

export async function sendTestTelemetry(payload: {
  deviceId: string;
  metric: string;
  value: number;
  threshold: number;
  apiKey: string;
}) {
  const res = await fetch("/api/telemetry/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${payload.apiKey}`,
    },
    body: JSON.stringify({
      deviceId: payload.deviceId,
      metric: payload.metric,
      value: payload.value,
      threshold: payload.threshold,
    }),
  });
  return res.json();
}
