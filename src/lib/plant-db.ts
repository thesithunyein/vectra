import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlantData } from "./plant-data";
import { EMPTY_PLANT } from "./plant-data";
import type { Alert, Device } from "./types";

export function isCloudUserId(userId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    userId
  );
}

export function generateApiKey(): string {
  const part = () => crypto.randomUUID().replace(/-/g, "");
  return `vk_${part()}${part().slice(0, 12)}`;
}

type WorkspaceRow = {
  user_id: string;
  devices: Device[];
  alerts: Alert[];
  maintenance: PlantData["maintenance"];
  records: PlantData["records"];
};

export async function getPlantWorkspace(
  supabase: SupabaseClient,
  userId: string
): Promise<PlantData | null> {
  const { data, error } = await supabase
    .from("plant_workspaces")
    .select("devices, alerts, maintenance, records")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    devices: (data.devices as Device[]) ?? [],
    alerts: (data.alerts as Alert[]) ?? [],
    maintenance: data.maintenance ?? [],
    records: data.records ?? [],
  };
}

export async function savePlantWorkspace(
  supabase: SupabaseClient,
  userId: string,
  plant: PlantData
): Promise<boolean> {
  const { error } = await supabase.from("plant_workspaces").upsert(
    {
      user_id: userId,
      devices: plant.devices,
      alerts: plant.alerts,
      maintenance: plant.maintenance,
      records: plant.records,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  return !error;
}

export async function deletePlantWorkspace(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("plant_workspaces")
    .delete()
    .eq("user_id", userId);
  return !error;
}

export async function getApiKeyByUser(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("plant_api_keys")
    .select("api_key")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.api_key ?? null;
}

export async function rotateApiKey(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const apiKey = generateApiKey();
  const { error } = await supabase.from("plant_api_keys").upsert(
    { user_id: userId, api_key: apiKey, created_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  return error ? null : apiKey;
}

export async function findUserByApiKey(
  supabase: SupabaseClient,
  apiKey: string
): Promise<string | null> {
  const { data } = await supabase
    .from("plant_api_keys")
    .select("user_id")
    .eq("api_key", apiKey)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function logTelemetry(
  supabase: SupabaseClient,
  entry: {
    userId: string;
    deviceId: string;
    metric: string;
    value: number;
    threshold?: number;
  }
) {
  await supabase.from("plant_telemetry_log").insert({
    user_id: entry.userId,
    device_id: entry.deviceId,
    metric: entry.metric,
    value: entry.value,
    threshold: entry.threshold ?? null,
  });
}

export function emptyPlant(): PlantData {
  return { ...EMPTY_PLANT };
}
