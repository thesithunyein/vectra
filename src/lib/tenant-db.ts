import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlantData } from "./plant-data";
import type { Alert, Device } from "./types";
import {
  generateInviteCode,
  mqttTopicForKey,
  type PlantRole,
  type PlantTenant,
} from "./tenant-types";
import { generateApiKey } from "./plant-db";

type TenantRow = {
  id: string;
  name: string;
  site: string;
  invite_code: string;
};

function asTenantRow(value: unknown): TenantRow | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as TenantRow | undefined) ?? null;
  return value as TenantRow;
}

export type PlantScope = {
  mode: "tenant" | "user";
  scopeId: string;
  tenantId?: string;
  role: PlantRole;
  tenant?: PlantTenant;
};

export async function resolvePlantScope(
  admin: SupabaseClient,
  userId: string
): Promise<PlantScope> {
  const { data: membership } = await admin
    .from("plant_members")
    .select("tenant_id, role, plant_tenants(id, name, site, invite_code)")
    .eq("user_id", userId)
    .maybeSingle();

  if (membership?.tenant_id) {
    const tenantRow = asTenantRow(membership.plant_tenants);

    const { count } = await admin
      .from("plant_members")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", membership.tenant_id);

    return {
      mode: "tenant",
      scopeId: membership.tenant_id,
      tenantId: membership.tenant_id,
      role: membership.role as PlantRole,
      tenant: tenantRow
        ? {
            id: tenantRow.id,
            name: tenantRow.name,
            site: tenantRow.site,
            inviteCode: tenantRow.invite_code,
            role: membership.role as PlantRole,
            memberCount: count ?? 1,
          }
        : undefined,
    };
  }

  return { mode: "user", scopeId: userId, role: "owner" };
}

export async function ensureTenantForUser(
  admin: SupabaseClient,
  userId: string,
  plantName: string,
  plantSite: string
): Promise<PlantScope> {
  const existing = await resolvePlantScope(admin, userId);
  if (existing.mode === "tenant") return existing;

  const inviteCode = generateInviteCode();
  const { data: tenant, error } = await admin
    .from("plant_tenants")
    .insert({
      name: plantName,
      site: plantSite,
      invite_code: inviteCode,
      owner_user_id: userId,
    })
    .select("id, name, site, invite_code")
    .single();

  if (error || !tenant) {
    return { mode: "user", scopeId: userId, role: "owner" };
  }

  await admin.from("plant_members").insert({
    tenant_id: tenant.id,
    user_id: userId,
    role: "owner",
  });

  // Migrate solo user workspace if present
  const { data: solo } = await admin
    .from("plant_workspaces")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (solo) {
    await admin.from("plant_tenant_workspaces").upsert({
      tenant_id: tenant.id,
      devices: solo.devices,
      alerts: solo.alerts,
      maintenance: solo.maintenance,
      records: solo.records,
      updated_at: new Date().toISOString(),
    });
  }

  return {
    mode: "tenant",
    scopeId: tenant.id,
    tenantId: tenant.id,
    role: "owner",
    tenant: {
      id: tenant.id,
      name: tenant.name,
      site: tenant.site,
      inviteCode: tenant.invite_code,
      role: "owner",
      memberCount: 1,
    },
  };
}

export async function joinTenantByCode(
  admin: SupabaseClient,
  userId: string,
  inviteCode: string,
  role: PlantRole = "maintenance"
): Promise<{ ok: boolean; error?: string; tenant?: PlantTenant }> {
  const code = inviteCode.trim().toUpperCase();
  const { data: tenant } = await admin
    .from("plant_tenants")
    .select("id, name, site, invite_code")
    .eq("invite_code", code)
    .maybeSingle();

  if (!tenant) return { ok: false, error: "Invalid invite code." };

  const { error } = await admin.from("plant_members").upsert(
    {
      tenant_id: tenant.id,
      user_id: userId,
      role: role === "owner" ? "maintenance" : role,
    },
    { onConflict: "tenant_id,user_id" }
  );

  if (error) return { ok: false, error: "Could not join plant team." };

  const { count } = await admin
    .from("plant_members")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);

  return {
    ok: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      site: tenant.site,
      inviteCode: tenant.invite_code,
      role: role === "owner" ? "maintenance" : role,
      memberCount: count ?? 1,
    },
  };
}

export async function getScopedPlantWorkspace(
  admin: SupabaseClient,
  scope: PlantScope
): Promise<PlantData | null> {
  if (scope.mode === "tenant") {
    const { data } = await admin
      .from("plant_tenant_workspaces")
      .select("devices, alerts, maintenance, records")
      .eq("tenant_id", scope.scopeId)
      .maybeSingle();
    if (!data) return null;
    return {
      devices: (data.devices as Device[]) ?? [],
      alerts: (data.alerts as Alert[]) ?? [],
      maintenance: data.maintenance ?? [],
      records: data.records ?? [],
    };
  }

  const { data } = await admin
    .from("plant_workspaces")
    .select("devices, alerts, maintenance, records")
    .eq("user_id", scope.scopeId)
    .maybeSingle();
  if (!data) return null;
  return {
    devices: (data.devices as Device[]) ?? [],
    alerts: (data.alerts as Alert[]) ?? [],
    maintenance: data.maintenance ?? [],
    records: data.records ?? [],
  };
}

export async function saveScopedPlantWorkspace(
  admin: SupabaseClient,
  scope: PlantScope,
  plant: PlantData
): Promise<boolean> {
  const row = {
    devices: plant.devices,
    alerts: plant.alerts,
    maintenance: plant.maintenance,
    records: plant.records,
    updated_at: new Date().toISOString(),
  };

  if (scope.mode === "tenant") {
    const { error } = await admin.from("plant_tenant_workspaces").upsert(
      { tenant_id: scope.scopeId, ...row },
      { onConflict: "tenant_id" }
    );
    return !error;
  }

  const { error } = await admin.from("plant_workspaces").upsert(
    { user_id: scope.scopeId, ...row },
    { onConflict: "user_id" }
  );
  return !error;
}

export async function deleteScopedPlantWorkspace(
  admin: SupabaseClient,
  scope: PlantScope
): Promise<boolean> {
  if (scope.mode === "tenant") {
    const { error } = await admin
      .from("plant_tenant_workspaces")
      .delete()
      .eq("tenant_id", scope.scopeId);
    return !error;
  }
  const { error } = await admin.from("plant_workspaces").delete().eq("user_id", scope.scopeId);
  return !error;
}

export async function getScopedApiKey(
  admin: SupabaseClient,
  scope: PlantScope
): Promise<{ apiKey: string; mqttTopic: string } | null> {
  if (scope.mode === "tenant") {
    let { data } = await admin
      .from("plant_tenant_api_keys")
      .select("api_key, mqtt_topic")
      .eq("tenant_id", scope.scopeId)
      .maybeSingle();

    if (!data) {
      const apiKey = generateApiKey();
      const mqttTopic = mqttTopicForKey(apiKey);
      const { error } = await admin.from("plant_tenant_api_keys").insert({
        tenant_id: scope.scopeId,
        api_key: apiKey,
        mqtt_topic: mqttTopic,
      });
      if (error) return null;
      return { apiKey, mqttTopic };
    }
    return { apiKey: data.api_key, mqttTopic: data.mqtt_topic };
  }

  const { data } = await admin
    .from("plant_api_keys")
    .select("api_key")
    .eq("user_id", scope.scopeId)
    .maybeSingle();

  if (!data) return null;
  return { apiKey: data.api_key, mqttTopic: mqttTopicForKey(data.api_key) };
}

export async function rotateScopedApiKey(
  admin: SupabaseClient,
  scope: PlantScope
): Promise<{ apiKey: string; mqttTopic: string } | null> {
  const apiKey = generateApiKey();
  const mqttTopic = mqttTopicForKey(apiKey);

  if (scope.mode === "tenant") {
    const { error } = await admin.from("plant_tenant_api_keys").upsert(
      {
        tenant_id: scope.scopeId,
        api_key: apiKey,
        mqtt_topic: mqttTopic,
        created_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" }
    );
    return error ? null : { apiKey, mqttTopic };
  }

  const { error } = await admin.from("plant_api_keys").upsert(
    { user_id: scope.scopeId, api_key: apiKey, created_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  return error ? null : { apiKey, mqttTopic };
}

export async function findScopeByApiKey(
  admin: SupabaseClient,
  apiKey: string
): Promise<{ scope: PlantScope; mqttTopic: string } | null> {
  const { data: tenantKey } = await admin
    .from("plant_tenant_api_keys")
    .select("tenant_id, mqtt_topic")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (tenantKey) {
    return {
      scope: {
        mode: "tenant",
        scopeId: tenantKey.tenant_id,
        tenantId: tenantKey.tenant_id,
        role: "owner",
      },
      mqttTopic: tenantKey.mqtt_topic,
    };
  }

  const { data: userKey } = await admin
    .from("plant_api_keys")
    .select("user_id")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (!userKey) return null;
  return {
    scope: { mode: "user", scopeId: userKey.user_id, role: "owner" },
    mqttTopic: mqttTopicForKey(apiKey),
  };
}

export async function logScopedTelemetry(
  admin: SupabaseClient,
  scope: PlantScope,
  entry: {
    deviceId: string;
    metric: string;
    value: number;
    threshold?: number;
    source?: string;
  }
) {
  if (scope.mode === "tenant") {
    await admin.from("plant_tenant_telemetry_log").insert({
      tenant_id: scope.scopeId,
      device_id: entry.deviceId,
      metric: entry.metric,
      value: entry.value,
      threshold: entry.threshold ?? null,
      source: entry.source ?? "http",
    });
    return;
  }
  await admin.from("plant_telemetry_log").insert({
    user_id: scope.scopeId,
    device_id: entry.deviceId,
    metric: entry.metric,
    value: entry.value,
    threshold: entry.threshold ?? null,
  });
}

export async function listTenantMembers(
  admin: SupabaseClient,
  tenantId: string
): Promise<Array<{ role: PlantRole; userId: string }>> {
  const { data } = await admin
    .from("plant_members")
    .select("user_id, role")
    .eq("tenant_id", tenantId);
  return (data ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role as PlantRole,
  }));
}
