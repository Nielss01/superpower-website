// ── Supabase query helpers ─────────────────────────────────────────────────────
// All functions use the browser client so they work in both "use client"
// components and server components (via the server client import below).
// For server-side calls (CRM pages, etc.) import from queries-server.ts instead.

import { createClient } from "@/lib/supabase/client";
import type { MarketplaceListing, MarketplaceReview, ServiceItem } from "@/lib/marketplace-data";

// ── Category meta ─────────────────────────────────────────────────────────────

export type CategoryMeta = {
  key: string;
  name: string;
  emoji: string;
  color: string;
  wash: string;
};

export type CategoryMetaMap = Record<string, CategoryMeta>;

export async function fetchCategories(): Promise<CategoryMetaMap> {
  const supabase = createClient();
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

// ── Locations ─────────────────────────────────────────────────────────────────

export async function fetchLocations(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marketplace_locations")
    .select("name")
    .eq("active", true)
    .order("sort_order");
  if (error || !data) return [];
  return data.map((r) => r.name);
}

// ── Category counts ───────────────────────────────────────────────────────────

export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("marketplace_profiles")
    .select("category")
    .eq("is_published", true);
  if (!data) return {};
  const counts: Record<string, number> = { all: data.length };
  for (const row of data) {
    if (row.category) counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}

// ── Listing mapper ────────────────────────────────────────────────────────────

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
    (r: { id: string; reviewer_id: string; reviewer_name: string; rating: number; title: string | null; body: string | null; created_at: string }) => ({
      id: r.id,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer_name,
      rating: r.rating,
      title: r.title ?? "",
      body: r.body ?? "",
      date: r.created_at?.slice(0, 10) ?? "",
    }),
  );

  return {
    id: row.id,
    userId: row.user_id ?? "",
    businessName: row.business_name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    services,
    location: row.locations ?? [],
    website: row.website ?? null,
    whatsappNumber: row.whatsapp_number ?? "",
    category: row.category ?? "Services",
    profilePhotoUrl: row.profile_photo_url ?? "",
    servicePhotoUrls: row.service_photo_urls ?? [],
    reviews,
    isVerified: row.is_verified ?? false,
    responseTime: row.response_time ?? null,
  };
}

// ── Listings ──────────────────────────────────────────────────────────────────

export async function fetchListings(): Promise<MarketplaceListing[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select(`
      *,
      marketplace_services ( id, name, price, description, sort_order ),
      reviews ( id, reviewer_id, reviewer_name, rating, title, body, created_at )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapListing);
}

export async function fetchListing(id: string): Promise<MarketplaceListing | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select(`
      *,
      marketplace_services ( id, name, price, description, sort_order ),
      reviews ( id, reviewer_id, reviewer_name, rating, title, body, created_at )
    `)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return mapListing(data);
}

// ── Fetch the current user's own listing ──────────────────────────────────────

export type MyListingSummary = {
  id: string;
  businessName: string;
  isPublished: boolean;
};

export async function fetchMyMarketplaceListing(): Promise<MyListingSummary | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select("id, business_name, is_published")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id, businessName: data.business_name, isPublished: data.is_published };
}

// ── Publish a new listing ─────────────────────────────────────────────────────

export type NewListingPayload = {
  businessName: string;
  tagline: string;
  description: string;
  locations: string[];
  category: string;
  whatsappNumber: string;
  responseTime: string;
  services: ServiceItem[];
};

export async function publishListing(payload: NewListingPayload): Promise<{ id: string } | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("marketplace_profiles")
    .upsert({
      user_id: user.id,
      business_name: payload.businessName,
      tagline: payload.tagline,
      description: payload.description,
      locations: payload.locations,
      category: payload.category,
      whatsapp_number: payload.whatsappNumber,
      response_time: payload.responseTime || null,
      is_published: true,
    }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (profileError || !profile) return null;

  // Replace services: delete existing then re-insert
  await supabase.from("marketplace_services").delete().eq("profile_id", profile.id);

  const serviceRows = payload.services
    .filter((s) => s.name.trim())
    .map((s, i) => ({
      profile_id: profile.id,
      name: s.name.trim(),
      price: s.price.trim() || null,
      sort_order: i,
    }));

  if (serviceRows.length > 0) {
    await supabase.from("marketplace_services").insert(serviceRows);
  }

  return { id: profile.id };
}
