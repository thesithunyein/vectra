import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getApiKeyByUser,
  isCloudUserId,
  rotateApiKey,
} from "@/lib/plant-db";

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

  let apiKey = await getApiKeyByUser(supabase, user.id);
  if (!apiKey) {
    apiKey = await rotateApiKey(supabase, user.id);
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Could not load API key. Run supabase/schema.sql first." },
      { status: 500 }
    );
  }

  return NextResponse.json({ apiKey });
}

export async function POST() {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await rotateApiKey(supabase, user.id);
  if (!apiKey) {
    return NextResponse.json({ error: "Could not rotate API key." }, { status: 500 });
  }

  return NextResponse.json({ apiKey });
}
