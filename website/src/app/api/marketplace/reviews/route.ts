import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { profile_id, rating, title, body: reviewBody } = body as {
    profile_id: string;
    rating: number;
    title?: string;
    body?: string;
  };

  if (!profile_id || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Extract first name for privacy
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const firstName = fullName.split(" ")[0].trim() || user.email?.split("@")[0] || "Anonymous";

  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        profile_id,
        reviewer_id: user.id,
        reviewer_name: firstName,
        rating,
        title: title?.trim() || null,
        body: reviewBody?.trim() || null,
      },
      { onConflict: "profile_id,reviewer_id" },
    )
    .select("id, reviewer_id, reviewer_name, rating, title, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ review: data });
}
