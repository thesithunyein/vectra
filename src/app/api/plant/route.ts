import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deletePlantWorkspace,
  getPlantWorkspace,
  isCloudUserId,
  savePlantWorkspace,
} from "@/lib/plant-db";
import type { PlantData } from "@/lib/plant-data";
import { EMPTY_PLANT } from "@/lib/plant-data";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isCloudUserId(user.id)) {
    return { supabase, user: null as null };
  }
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plant = await getPlantWorkspace(supabase, user.id);
  return NextResponse.json(plant ?? EMPTY_PLANT);
}

export async function PUT(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PlantData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ok = await savePlantWorkspace(supabase, user.id, {
    devices: body.devices ?? [],
    alerts: body.alerts ?? [],
    maintenance: body.maintenance ?? [],
    records: body.records ?? [],
  });

  if (!ok) {
    return NextResponse.json(
      {
        error:
          "Could not save plant workspace. Run supabase/schema.sql in your Supabase project.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deletePlantWorkspace(supabase, user.id);
  return NextResponse.json({ ok: true });
}
