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

  const planPayload = {
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
  };

  // 1. Check for existing business plan, then update or insert
  const { data: existingPlan } = await supabase
    .from("business_plans")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  let plan: { id: string } | null = null;
  let planError: unknown = null;

  if (existingPlan) {
    const { data, error } = await supabase
      .from("business_plans")
      .update(planPayload)
      .eq("id", existingPlan.id)
      .select("id")
      .single();
    plan = data;
    planError = error;
  } else {
    const { data, error } = await supabase
      .from("business_plans")
      .insert(planPayload)
      .select("id")
      .single();
    plan = data;
    planError = error;
  }

  if (planError || !plan) {
    console.error("Error saving business plan:", planError);
    return null;
  }

  const profilePayload = {
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
  };

  // 2. Check for existing profile, then update or insert
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  let profileError: unknown = null;

  if (existingProfile) {
    const { error } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", existingProfile.id)
      .select("slug")
      .single();
    profileError = error;
  } else {
    const { error } = await supabase
      .from("profiles")
      .insert(profilePayload)
      .select("slug")
      .single();
    profileError = error;
  }

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

// ── Load all business plans for current user ────────────────────────────────

export async function fetchMyPlans(): Promise<{
  profile: ProfileRow;
  businessPlan: BusinessPlanRow | null;
}[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !profiles || profiles.length === 0) return [];

  const results: { profile: ProfileRow; businessPlan: BusinessPlanRow | null }[] = [];

  for (const p of profiles) {
    let businessPlan: BusinessPlanRow | null = null;
    if (p.business_plan_id) {
      const { data: bp } = await supabase
        .from("business_plans")
        .select("*")
        .eq("id", p.business_plan_id)
        .single();
      businessPlan = bp ?? null;
    }
    results.push({ profile: p as ProfileRow, businessPlan });
  }

  return results;
}

// ── Convert DB rows to ProfileData ──────────────────────────────────────────

export function rowsToProfileData(
  profile: ProfileRow,
  businessPlan: BusinessPlanRow | null,
): import("@/lib/types").ProfileData {
  // Parse target_customers from comma-separated string
  const targetCustomers = businessPlan?.target_customers
    ? businessPlan.target_customers.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  // Parse marketing from formatted string
  const marketing = { hook: "", platform: "", wordOfMouth: "" };
  if (businessPlan?.marketing_and_sales) {
    const m = businessPlan.marketing_and_sales;
    const hookMatch = m.match(/Hook:\s*(.+?)(?:\.|$)/);
    const platformMatch = m.match(/Platform:\s*(.+?)(?:\.|$)/);
    const womMatch = m.match(/Word of mouth:\s*(.+?)(?:\.|$)/);
    if (hookMatch) marketing.hook = hookMatch[1].trim();
    if (platformMatch) marketing.platform = platformMatch[1].trim();
    if (womMatch) marketing.wordOfMouth = womMatch[1].trim();
  }

  // Parse startup_costs from formatted string
  const startingCosts: { items: { name: string; cost: string }[]; total: string } = { items: [], total: "" };
  if (businessPlan?.startup_costs) {
    const totalMatch = businessPlan.startup_costs.match(/\(Total:\s*(.+?)\)/);
    if (totalMatch) startingCosts.total = totalMatch[1].trim();
    const itemsPart = businessPlan.startup_costs.replace(/\(Total:.*\)/, "").trim();
    if (itemsPart) {
      startingCosts.items = itemsPart.split(",").map(s => {
        const [name, cost] = s.split(":").map(p => p.trim());
        return { name: name || "", cost: cost || "" };
      }).filter(i => i.name);
    }
  }

  return {
    idea: profile.idea_id ? {
      id: profile.idea_id, emoji: "⚡",
      name: profile.business_name || "",
      nameSA: profile.business_name || "",
      category: "business" as import("@/lib/ideas").Category,
      earning: "", description: "", descriptionSA: "",
    } : null,
    name: profile.name,
    wijk: profile.wijk || "",
    services: (profile.services || []) as { name: string; price: string; description?: string }[],
    bio: profile.bio || businessPlan?.solution || "",
    plan: profile.plan || [],
    photoUrl: profile.photo_url || null,
    tagline: profile.tagline || "",
    story: profile.story || "",
    availability: profile.availability || "",
    promise: profile.promise || "",
    slug: profile.slug,
    problem: businessPlan?.problem || "",
    targetCustomers,
    marketing,
    startingCosts,
    mvp: businessPlan?.mvp || "",
  };
}

// ── Helper ──────────────────────────────────────────────────────────────────

function generateSlug(name: string, ideaName: string): string {
  return (name || "my")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + (ideaName || "biz").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
}
