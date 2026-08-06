import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCloudUserId } from "@/lib/plant-db";
import {
  ensureTenantForUser,
  getScopedApiKey,
  resolvePlantScope,
  rotateScopedApiKey,
} from "@/lib/tenant-db";
import { loadWorkspace } from "@/lib/workspace";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isCloudUserId(user.id)) {
    return { user: null as null, admin: null };
  }
  return { user, admin: createAdminClient() };
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

  let keys = await getScopedApiKey(admin, scope);
  if (!keys) {
    keys = await rotateScopedApiKey(admin, scope);
  }

  if (!keys) {
    return NextResponse.json(
      { error: "Could not load API key. Run supabase/schema-v2-tenants.sql first." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    apiKey: keys.apiKey,
    mqttTopic: keys.mqttTopic,
  });
}

export async function POST() {
  const { user, admin } = await requireUser();
  if (!user || !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = await resolvePlantScope(admin, user.id);
  if (scope.role !== "owner" && scope.role !== "ops_lead") {
    return NextResponse.json({ error: "Only owner or ops lead can rotate keys." }, { status: 403 });
  }

  const keys = await rotateScopedApiKey(admin, scope);
  if (!keys) {
    return NextResponse.json({ error: "Could not rotate API key." }, { status: 500 });
  }

  return NextResponse.json(keys);
}
