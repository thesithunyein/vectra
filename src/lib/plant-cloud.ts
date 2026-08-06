import type { PlantData } from "./plant-data";
import type { PlantRole, PlantTenant } from "./tenant-types";

export type PlantCloudResponse = PlantData & {
  tenant?: PlantTenant | null;
  role?: PlantRole;
};

export type TelemetryKeyInfo = {
  apiKey: string;
  mqttTopic: string;
};

export async function fetchPlantFromCloud(): Promise<PlantCloudResponse | null> {
  try {
    const res = await fetch("/api/plant", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as PlantCloudResponse;
    return {
      devices: data.devices ?? [],
      alerts: data.alerts ?? [],
      maintenance: data.maintenance ?? [],
      records: data.records ?? [],
      tenant: data.tenant ?? null,
      role: data.role,
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

export async function fetchTelemetryKeyInfo(): Promise<TelemetryKeyInfo | null> {
  try {
    const res = await fetch("/api/plant/api-key", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as TelemetryKeyInfo;
    if (!data.apiKey) return null;
    return { apiKey: data.apiKey, mqttTopic: data.mqttTopic ?? "" };
  } catch {
    return null;
  }
}

/** @deprecated use fetchTelemetryKeyInfo */
export async function fetchTelemetryApiKey(): Promise<string | null> {
  const info = await fetchTelemetryKeyInfo();
  return info?.apiKey ?? null;
}

export async function rotateTelemetryApiKey(): Promise<TelemetryKeyInfo | null> {
  try {
    const res = await fetch("/api/plant/api-key", { method: "POST" });
    if (!res.ok) return null;
    const data = (await res.json()) as TelemetryKeyInfo;
    if (!data.apiKey) return null;
    return { apiKey: data.apiKey, mqttTopic: data.mqttTopic ?? "" };
  } catch {
    return null;
  }
}

export async function fetchTenantInfo(): Promise<{
  tenant: PlantTenant | null;
  role: PlantRole | null;
  members: number;
} | null> {
  try {
    const res = await fetch("/api/tenant", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tenant?: PlantTenant | null;
      role?: PlantRole;
      members?: number;
    };
    return {
      tenant: data.tenant ?? null,
      role: data.role ?? null,
      members: data.members ?? 0,
    };
  } catch {
    return null;
  }
}

export async function createPlantTeam(
  plant?: string,
  site?: string
): Promise<{ ok: boolean; error?: string; tenant?: PlantTenant; role?: PlantRole }> {
  try {
    const res = await fetch("/api/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plant, site }),
    });
    const data = (await res.json()) as {
      tenant?: PlantTenant;
      role?: PlantRole;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: data.error ?? "Could not create plant team." };
    if (!data.tenant) {
      return {
        ok: false,
        error:
          "Plant team tables missing. Run supabase/schema-v2-tenants.sql in Supabase SQL Editor, then try again.",
      };
    }
    return { ok: true, tenant: data.tenant, role: data.role };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export async function joinPlantTeam(
  inviteCode: string,
  role: PlantRole = "maintenance"
): Promise<{ ok: boolean; error?: string; tenant?: PlantTenant }> {
  try {
    const res = await fetch("/api/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", inviteCode, role }),
    });
    const data = (await res.json()) as { tenant?: PlantTenant; error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "Join failed" };
    return { ok: true, tenant: data.tenant };
  } catch {
    return { ok: false, error: "Network error" };
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
      source: "http",
    }),
  });
  return res.json();
}
