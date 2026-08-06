import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCloudUserId } from "@/lib/plant-db";
import {
  deleteScopedPlantWorkspace,
  ensureTenantForUser,
  getScopedPlantWorkspace,
  resolvePlantScope,
  saveScopedPlantWorkspace,
} from "@/lib/tenant-db";
import { canWritePlant } from "@/lib/tenant-types";
import type { PlantData } from "@/lib/plant-data";
import { EMPTY_PLANT } from "@/lib/plant-data";
import { loadWorkspace } from "@/lib/workspace";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isCloudUserId(user.id)) {
    return { supabase, user: null as null, admin: null };
  }
  const admin = createAdminClient();
  return { supabase, user, admin };
}

export async function GET() {
  const { user, admin } = await requireUser();
  if (!user || !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let scope = await resolvePlantScope(admin, user.id);
  if (scope.mode === "user") {
    const ws = loadWorkspace(user.id);
    scope = await ensureTenantForUser(admin, user.id, ws.plant, ws.plantSite);
  }

  const plant = await getScopedPlantWorkspace(admin, scope);
  return NextResponse.json({
    ...((plant ?? EMPTY_PLANT) as PlantData),
    tenant: scope.tenant ?? null,
    role: scope.role,
  });
}

export async function PUT(request: Request) {
  const { user, admin } = await requireUser();
  if (!user || !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = await resolvePlantScope(admin, user.id);
  if (!canWritePlant(scope.role)) {
    return NextResponse.json({ error: "Read-only access for vendor role." }, { status: 403 });
  }

  let body: PlantData & { tenant?: unknown; role?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ok = await saveScopedPlantWorkspace(admin, scope, {
    devices: body.devices ?? [],
    alerts: body.alerts ?? [],
    maintenance: body.maintenance ?? [],
    records: body.records ?? [],
  });

  if (!ok) {
    return NextResponse.json(
      {
        error:
          "Could not save plant workspace. Run supabase/schema-v2-tenants.sql in Supabase.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { user, admin } = await requireUser();
  if (!user || !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = await resolvePlantScope(admin, user.id);
  if (scope.role !== "owner") {
    return NextResponse.json({ error: "Only plant owner can clear workspace data." }, { status: 403 });
  }

  await deleteScopedPlantWorkspace(admin, scope);
  return NextResponse.json({ ok: true });
}
