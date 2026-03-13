import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — keeps the user logged in across tab closes
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /marketplace/new
  if (!user && request.nextUrl.pathname.startsWith("/marketplace/new")) {
    const url = request.nextUrl.clone();
    url.pathname = "/marketplace";
    url.searchParams.set("signin", "1");
    return NextResponse.redirect(url);
  }

  // Protect /crm/* (except /crm/login and API routes)
  const path = request.nextUrl.pathname;
  if (path.startsWith("/crm") && !path.startsWith("/crm/login") && !path.startsWith("/api/crm")) {
    const token    = process.env.CRM_AUTH_TOKEN;
    const cookie   = request.cookies.get("sph_crm_auth")?.value;
    if (!token || cookie !== token) {
      const url = request.nextUrl.clone();
      url.pathname = "/crm/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
