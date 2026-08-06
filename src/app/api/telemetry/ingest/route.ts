import { NextResponse } from "next/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import {
  findUserByApiKey,
  getPlantWorkspace,
  logTelemetry,
  savePlantWorkspace,
} from "@/lib/plant-db";
import { EMPTY_PLANT } from "@/lib/plant-data";
import { applyTelemetrySignal, type TelemetryPayload } from "@/lib/telemetry";

function extractApiKey(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  const header = request.headers.get("x-vectra-key");
  return header?.trim() || null;
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Telemetry ingest requires SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 }
    );
  }

  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured." }, { status: 503 });
  }

  const userId = await findUserByApiKey(admin, apiKey);
  if (!userId) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  let body: TelemetryPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.deviceId?.trim() || !body.metric?.trim()) {
    return NextResponse.json(
      { error: "deviceId and metric are required." },
      { status: 400 }
    );
  }

  if (typeof body.value !== "number" || Number.isNaN(body.value)) {
    return NextResponse.json({ error: "value must be a number." }, { status: 400 });
  }

  const plant = (await getPlantWorkspace(admin, userId)) ?? EMPTY_PLANT;
  const result = applyTelemetrySignal(plant, {
    deviceId: body.deviceId.trim(),
    metric: body.metric.trim(),
    value: body.value,
    threshold: body.threshold,
    unit: body.unit,
  });

  if (!result.alertCreated && !plant.devices.some((d) => d.id === body.deviceId.trim())) {
    return NextResponse.json(
      { error: `Device "${body.deviceId}" not found in plant workspace.` },
      { status: 404 }
    );
  }

  const saved = await savePlantWorkspace(admin, userId, result.plant);
  if (!saved) {
    return NextResponse.json({ error: "Could not persist telemetry signal." }, { status: 500 });
  }

  await logTelemetry(admin, {
    userId,
    deviceId: body.deviceId.trim(),
    metric: body.metric.trim(),
    value: body.value,
    threshold: body.threshold,
  });

  return NextResponse.json({
    ok: true,
    alertCreated: result.alertCreated,
    alertId: result.alertId,
    deviceId: body.deviceId,
    metric: body.metric,
    value: body.value,
    threshold: body.threshold ?? 3,
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/telemetry/ingest",
    method: "POST",
    auth: "Authorization: Bearer <your-vectra-api-key>",
    body: {
      deviceId: "SMT-01",
      metric: "reject_rate",
      value: 4.2,
      threshold: 3.0,
      unit: "percent",
    },
  });
}
