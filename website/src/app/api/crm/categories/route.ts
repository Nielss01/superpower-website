import { NextRequest, NextResponse } from "next/server";
import { checkCrmAuth } from "@/lib/crm-auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  const { data, error } = await supabase
    .from("marketplace_categories")
    .select("*")
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  if (body.sort_order != null) {
    await supabase.rpc("shift_sort_order_up", { p_table: "marketplace_categories", p_from: body.sort_order });
  }
  const { data, error } = await supabase
    .from("marketplace_categories")
    .insert({
      key:        body.key,
      name:       body.name,
      emoji:      body.emoji,
      color:      body.color,
      wash:       body.wash,
      sort_order: body.sort_order ?? 0,
      active:     body.active ?? true,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
