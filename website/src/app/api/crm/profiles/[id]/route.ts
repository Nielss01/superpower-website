import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { checkCrmAuth } from "@/lib/crm-auth";

export const runtime = "nodejs";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { id } = await params;

  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select(`
      id, user_id, business_name, tagline, description, category, locations,
      whatsapp_number, website, response_time, is_published, is_verified,
      profile_photo_url, service_photo_urls,
      marketplace_services ( id, name, price, description, sort_order )
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { id } = await params;
  const body = await req.json();

  // Whitelist updatable fields
  const allowed = [
    "business_name", "tagline", "description", "category", "locations",
    "whatsapp_number", "website", "response_time", "is_published", "is_verified",
  ];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from("marketplace_profiles").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
