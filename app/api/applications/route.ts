import { randomBytes, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateAnswers } from "@/lib/application-validation";
import { clientAddress, consumeRateLimit, databaseErrorResponse, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeReportId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const token = Array.from(bytes, (byte) => alphabet[byte & 31]).join("");
  return `GF-${token.slice(0, 4)}-${token.slice(4)}`;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 300_000) return NextResponse.json({ error: "Application is too large." }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Application could not be read." }, { status: 400 }); }
  const validation = validateAnswers((body as { answers?: unknown })?.answers);
  if (!validation.answers) return NextResponse.json({ error: validation.error }, { status: 400 });

  try {
    const sql = await getSql();
    const limit = await consumeRateLimit(sql, "submit", clientAddress(request), 5, 60 * 60 * 1000);
    if (limit.limited) return NextResponse.json({ error: "Too many submissions from this network. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" } });
    const id = randomUUID();
    const answers = JSON.stringify(validation.answers);
    for (let attempt = 0; attempt < 3; attempt++) {
      const reportId = makeReportId();
      try {
        await sql`INSERT INTO gf_applications (id, report_id, answers) VALUES (${id}, ${reportId}, ${answers}::jsonb)`;
        return NextResponse.json({ id, reportId }, { status: 201, headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
    return NextResponse.json({ error: "The archive is temporarily unavailable." }, { status: 503 });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
