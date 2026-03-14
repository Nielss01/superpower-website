// ── Server-side Supabase query helpers ────────────────────────────────────────
// Use these in Server Components (e.g. CRM pages).
// For client components, import from queries.ts instead.

import { createClient } from "@/lib/supabase/server";
import type { CategoryMeta, CategoryMetaMap } from "@/lib/supabase/queries";
import type { MarketplaceListing } from "@/lib/marketplace-data";

export type { CategoryMeta, CategoryMetaMap };

export async function fetchCategoriesServer(): Promise<CategoryMetaMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_categories")
    .select("key, name, emoji, color, wash")
    .eq("active", true)
    .order("sort_order");
  if (error || !data) return {};
  const map: CategoryMetaMap = {};
  for (const row of data) map[row.key] = row;
  return map;
}

export async function fetchLocationsServer(): Promise<{ name: string; active: boolean; sort_order: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_locations")
    .select("name, active, sort_order")
    .order("sort_order");
  if (error || !data) return [];
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListingServer(row: any): MarketplaceListing & { isPublished: boolean } {
  return {
    id: row.id,
    businessName: row.business_name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    services: (row.marketplace_services ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((s: { name: string; price: string | null; description?: string | null }) => ({
        name: s.name,
        price: s.price ?? "",
        description: s.description ?? "",
      })),
    location: row.locations ?? [],
    website: row.website ?? null,
    whatsappNumber: row.whatsapp_number ?? "",
    category: row.category ?? "",
    profilePhotoUrl: row.profile_photo_url ?? "",
    servicePhotoUrls: row.service_photo_urls ?? [],
    reviews: (row.reviews ?? []).map(
      (r: { id: string; reviewer_name: string; rating: number; title: string | null; body: string | null; created_at: string }) => ({
        id: r.id,
        reviewerName: r.reviewer_name,
        rating: r.rating,
        title: r.title ?? "",
        body: r.body ?? "",
        date: r.created_at?.slice(0, 10) ?? "",
      }),
    ),
    isVerified: row.is_verified ?? false,
    responseTime: row.response_time ?? null,
    isPublished: row.is_published ?? false,
  };
}

export async function fetchListingsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select(`
      *,
      marketplace_services ( id, name, price, description, sort_order ),
      reviews ( id, reviewer_name, rating, title, body, created_at )
    `)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapListingServer);
}
