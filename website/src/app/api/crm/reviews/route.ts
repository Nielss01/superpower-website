import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { checkCrmAuth } from "@/lib/crm-auth";

export const runtime = "nodejs";

const PAGE_SIZE = 25;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const params = new URL(req.url).searchParams;
  const q    = params.get("q")?.trim().toLowerCase() ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("reviews")
    .select(
      `id, reviewer_id, reviewer_name, rating, title, body, created_at, is_hidden,
       marketplace_profiles ( id, business_name, category )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `reviewer_name.ilike.%${q}%,title.ilike.%${q}%,body.ilike.%${q}%`,
    );
  }

  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = (data ?? []).map((r: any) => ({
    id:           r.id,
    reviewerId:   r.reviewer_id,
    reviewerName: r.reviewer_name,
    rating:       r.rating,
    title:        r.title ?? "",
    body:         r.body ?? "",
    createdAt:    r.created_at,
    isHidden:     r.is_hidden,
    profile:      r.marketplace_profiles
      ? { id: r.marketplace_profiles.id, businessName: r.marketplace_profiles.business_name, category: r.marketplace_profiles.category }
      : null,
  }));

  return NextResponse.json({ reviews, total, page: safePage, pages });
}

export async function PATCH(req: NextRequest) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { id, is_hidden } = await req.json() as { id: string; is_hidden: boolean };
  if (!id || typeof is_hidden !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").update({ is_hidden }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
