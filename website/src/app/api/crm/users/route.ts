import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { checkCrmAuth } from "@/lib/crm-auth";

export const runtime = "nodejs";

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
  if (!(await checkCrmAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const q    = params.get("q")?.trim().toLowerCase() ?? "";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const supabase = createSupabaseClient(url, serviceKey, { auth: { persistSession: false } });

  const [usersRes, marketplaceRes, reviewersRes] = await Promise.all([
    supabase.rpc("get_admin_users"),
    supabase
      .from("marketplace_profiles")
      .select("id, user_id, business_name, tagline, category, locations, is_published, is_verified"),
    supabase.from("reviews").select("reviewer_id"),
  ]);

  if (usersRes.error) return NextResponse.json({ error: usersRes.error.message }, { status: 500 });

  const listingByUserId = Object.fromEntries(
    (marketplaceRes.data ?? []).map((r) => [r.user_id, r]),
  );
  const reviewerIds = new Set((reviewersRes.data ?? []).map((r) => r.reviewer_id));

  let users = usersRes.data.map((u) => ({
    id:         u.id,
    email:      u.email ?? null,
    createdAt:  u.created_at,
    lastSignIn: u.last_sign_in_at ?? null,
    provider:   u.provider ?? "email",
    listing:    listingByUserId[u.id] ?? null,
    isReviewer: reviewerIds.has(u.id),
  }));

  if (q) {
    users = users.filter((u) =>
      u.email?.toLowerCase().includes(q) ||
      u.listing?.business_name.toLowerCase().includes(q) ||
      u.id.includes(q),
    );
  }

  const total = users.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const slice = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return NextResponse.json({ users: slice, total, page: safePage, pages });
}
