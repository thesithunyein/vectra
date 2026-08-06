import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCloudUserId } from "@/lib/plant-db";
import {
  ensureTenantForUser,
  joinTenantByCode,
  listTenantMembers,
  resolvePlantScope,
} from "@/lib/tenant-db";
import type { PlantRole } from "@/lib/tenant-types";
import { loadWorkspace } from "@/lib/workspace";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isCloudUserId(user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  let scope = await resolvePlantScope(admin, user.id);
  if (scope.mode === "user") {
    const ws = loadWorkspace(user.id);
    scope = await ensureTenantForUser(admin, user.id, ws.plant, ws.plantSite);
  }

  const members = scope.tenantId
    ? await listTenantMembers(admin, scope.tenantId)
    : [];

  return NextResponse.json({
    tenant: scope.tenant,
    role: scope.role,
    members: members.length,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isCloudUserId(user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  let body: { action?: string; inviteCode?: string; role?: PlantRole; plant?: string; site?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action === "join") {
    if (!body.inviteCode?.trim()) {
      return NextResponse.json({ error: "Invite code required." }, { status: 400 });
    }
    const result = await joinTenantByCode(
      admin,
      user.id,
      body.inviteCode,
      body.role ?? "maintenance"
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ tenant: result.tenant, role: result.tenant?.role });
  }

  const ws = loadWorkspace(user.id);
  const scope = await ensureTenantForUser(
    admin,
    user.id,
    body.plant?.trim() || ws.plant,
    body.site?.trim() || ws.plantSite
  );

  if (scope.mode !== "tenant" || !scope.tenant) {
    return NextResponse.json(
      {
        error:
          "Could not create plant team. Run supabase/schema-v2-tenants.sql in Supabase SQL Editor, then try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ tenant: scope.tenant, role: scope.role });
}
