import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_TTL_MS, createAdminSession, isAdminConfigured } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin access has not been configured for this deployment." }, { status: 503 });
  }

  const address = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  const attempt = attempts.get(address);
  if (attempt && attempt.count >= MAX_ATTEMPTS && attempt.resetAt > now) {
    return NextResponse.json({ error: "Too many attempts. Wait before trying again." }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((attempt.resetAt - now) / 1000)), "Cache-Control": "no-store" },
    });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password.slice(0, 512) : "";
  } catch {
    return NextResponse.json({ error: "Enter the admin password." }, { status: 400 });
  }

  const suppliedDigest = createHash("sha256").update(password).digest();
  const expectedDigest = createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest();
  if (!timingSafeEqual(suppliedDigest, expectedDigest)) {
    const current = attempts.get(address);
    attempts.set(address, { count: (current?.count || 0) + 1, resetAt: current?.resetAt || now + ATTEMPT_WINDOW_MS });
    return NextResponse.json({ error: "Password not recognized." }, { status: 401 });
  }
  attempts.delete(address);

  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const token = await createAdminSession(process.env.ADMIN_SESSION_SECRET!, expiresAt);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(expiresAt),
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
