import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceListing, MarketplaceReview, ServiceItem } from "@/lib/marketplace-data";

export const runtime = "nodejs";

const PAGE_SIZE = 18;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListing(row: any): MarketplaceListing {
  const services: ServiceItem[] = (row.marketplace_services ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((s: { name: string; price: string | null; description?: string | null }) => ({
      name: s.name,
      price: s.price ?? "",
      description: s.description ?? "",
    }));

  const reviews: MarketplaceReview[] = (row.reviews ?? []).map(
    (r: { id: string; reviewer_name: string; rating: number; title: string | null; body: string | null; created_at: string }) => ({
      id: r.id,
      reviewerName: r.reviewer_name,
      rating: r.rating,
      title: r.title ?? "",
      body: r.body ?? "",
      date: r.created_at?.slice(0, 10) ?? "",
    }),
  );

  return {
    id: row.id,
    businessName: row.business_name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    services,
    location: row.locations ?? [],
    website: row.website ?? null,
    whatsappNumber: row.whatsapp_number ?? "",
    category: row.category ?? "",
    profilePhotoUrl: row.profile_photo_url ?? "",
    servicePhotoUrls: row.service_photo_urls ?? [],
    reviews,
    isVerified: row.is_verified ?? false,
    responseTime: row.response_time ?? null,
  };
}

export async function GET(req: NextRequest) {
  const params    = new URL(req.url).searchParams;
  const q         = params.get("q")?.trim() ?? "";
  const category  = params.get("category") ?? "all";
  const locations = params.get("locations")?.split(",").filter(Boolean) ?? [];
  const page      = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  let query = supabase
    .from("marketplace_profiles")
    .select(
      `id, business_name, tagline, description, locations, category,
       whatsapp_number, website, response_time, profile_photo_url,
       service_photo_urls, is_verified,
       marketplace_services ( id, name, price, description, sort_order ),
       reviews ( id, reviewer_name, rating, title, body, created_at )`,
      { count: "exact" },
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category !== "all") {
    query = query.eq("category", category);
  }
  if (locations.length > 0) {
    query = query.overlaps("locations", locations);
  }
  if (q) {
    // Escape SQL LIKE wildcards in the search term
    const safe = q.replace(/[%_\\]/g, "\\$&");
    query = query.or(
      `business_name.ilike.%${safe}%,tagline.ilike.%${safe}%,description.ilike.%${safe}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);

  return NextResponse.json({
    listings: (data ?? []).map(mapListing),
    total,
    page: safePage,
    pages,
  });
}
