// ── Supabase queries for business plans + builder profiles ────────────────────
import { createClient } from "@/lib/supabase/client";
import type { ProfileData } from "@/lib/types";

// ── Save business plan + builder profile ────────────────────────────────────

export async function saveProfileToSupabase(
  profile: ProfileData,
  lang: string,
): Promise<{ slug: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ideaId = profile.idea?.id ?? null;
  const ideaName = profile.idea?.name ?? "Custom Idea";
  const slug = profile.slug || generateSlug(profile.name, ideaName);

  // 1. Upsert business_plans
  const { data: plan, error: planError } = await supabase
    .from("business_plans")
    .upsert({
      user_id: user.id,
      idea_id: ideaId,
      idea_name: ideaName,
      business_name: profile.name + "'s " + ideaName,
      founder_name: profile.name,
      neighborhood: profile.wijk || null,
      problem: profile.problem || "",
      solution: profile.bio || "",
      target_customers: (profile.targetCustomers || []).join(", "),
      marketing_and_sales: profile.marketing
        ? `Hook: ${profile.marketing.hook}. Platform: ${profile.marketing.platform}. Word of mouth: ${profile.marketing.wordOfMouth}`
        : "",
      startup_costs: profile.startingCosts?.items
        ? profile.startingCosts.items.map(i => `${i.name}: ${i.cost}`).join(", ") + ` (Total: ${profile.startingCosts.total})`
        : "",
      pricing_and_revenue: (profile.services || []).map(s => `${s.name}: ${s.price}`).join(", "),
      mvp: profile.mvp || "",
    }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (planError || !plan) {
    console.error("Error saving business plan:", planError);
    return null;
  }

  // 2. Upsert profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      business_plan_id: plan.id,
      idea_id: ideaId,
      slug,
      name: profile.name,
      business_name: ideaName,
      wijk: profile.wijk || null,
      bio: profile.bio || null,
      tagline: profile.tagline || null,
      story: profile.story || null,
      availability: profile.availability || null,
      promise: profile.promise || null,
      photo_url: profile.photoUrl || null,
      services: profile.services || [],
      plan: profile.plan || [],
      lang: lang === "sa" ? "sa" : "en",
      is_published: true,
    }, { onConflict: "user_id" })
    .select("slug")
    .single();

  if (profileError) {
    console.error("Error saving builder profile:", profileError);
    return null;
  }

  return { slug };
}

// ── Load builder profile by slug (public) ───────────────────────────────────

export interface ProfileRow {
  id: string;
  slug: string;
  name: string;
  business_name: string | null;
  wijk: string | null;
  bio: string | null;
  tagline: string | null;
  story: string | null;
  availability: string | null;
  promise: string | null;
  photo_url: string | null;
  services: { name: string; price: string; description?: string }[];
  plan: string[];
  lang: string;
  idea_id: string | null;
  business_plan_id: string | null;
}

export interface BusinessPlanRow {
  id: string;
  idea_name: string;
  founder_name: string;
  neighborhood: string | null;
  problem: string;
  solution: string;
  target_customers: string;
  marketing_and_sales: string;
  startup_costs: string;
  pricing_and_revenue: string;
  mvp: string;
}

export async function fetchProfileBySlug(slug: string): Promise<{
  profile: ProfileRow;
  businessPlan: BusinessPlanRow | null;
} | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;

  let businessPlan: BusinessPlanRow | null = null;
  if (data.business_plan_id) {
    const { data: bp } = await supabase
      .from("business_plans")
      .select("*")
      .eq("id", data.business_plan_id)
      .single();
    businessPlan = bp ?? null;
  }

  return { profile: data as ProfileRow, businessPlan };
}

// ── Load builder profile for current user ───────────────────────────────────

export async function fetchMyProfile(): Promise<{
  profile: ProfileRow;
  businessPlan: BusinessPlanRow | null;
} | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;

  let businessPlan: BusinessPlanRow | null = null;
  if (data.business_plan_id) {
    const { data: bp } = await supabase
      .from("business_plans")
      .select("*")
      .eq("id", data.business_plan_id)
      .single();
    businessPlan = bp ?? null;
  }

  return { profile: data as ProfileRow, businessPlan };
}

// ── Helper ──────────────────────────────────────────────────────────────────

function generateSlug(name: string, ideaName: string): string {
  return (name || "my")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + (ideaName || "biz").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
}
