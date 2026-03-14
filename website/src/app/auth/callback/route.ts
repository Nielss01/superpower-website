import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Ensure a profile row exists for this user
        await ensureProfile(supabase);
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}

/**
 * Create a minimal profile row if one doesn't exist yet.
 * Uses the user's Google display name as the profile name.
 */
async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  if (!supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Check if a profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existing) return;

  // Extract name from Google user metadata
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Builder";

  const photoUrl = user.user_metadata?.avatar_url || null;

  await supabase.from("profiles").insert({
    user_id: user.id,
    name,
    photo_url: photoUrl,
    is_published: false,
  });
}
