import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const expected = process.env.CRM_PASSWORD;
  const token    = process.env.CRM_AUTH_TOKEN;

  if (!expected || !token) {
    return NextResponse.json({ error: "CRM not configured" }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("sph_crm_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 8 hours
    maxAge: 60 * 60 * 8,
  });
  return res;
}
