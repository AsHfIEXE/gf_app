import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminConfigured, verifyAdminSession } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  if (!isAdminConfigured()) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin access is not configured." }, { status: 503 });
    }
    return redirectToLogin(request);
  }

  const secret = process.env.ADMIN_SESSION_SECRET!;
  const valid = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value, secret);
  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return redirectToLogin(request);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  const returnTo = `${url.pathname}${url.search}`;
  url.pathname = "/admin-login";
  url.search = "";
  url.searchParams.set("next", returnTo);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
