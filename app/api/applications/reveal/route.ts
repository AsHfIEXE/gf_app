import { NextRequest, NextResponse } from "next/server";
import { revealFields } from "@/lib/application-validation";
import { clientAddress, consumeRateLimit, databaseErrorResponse, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Reveal request could not be read." }, { status: 400 }); }
  const reportId = typeof body.reportId === "string" ? body.reportId.trim().toUpperCase() : "";
  const fields = Array.isArray(body.fields) ? body.fields : [];
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!/^GF-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(reportId) || !fields.length || fields.length > revealFields.length || fields.some((field) => !revealFields.includes(field as typeof revealFields[number])) || !message || message.length > 4000) {
    return NextResponse.json({ error: "Choose at least one valid contact field and enter a message." }, { status: 400 });
  }
  try {
    const sql = await getSql();
    const limit = await consumeRateLimit(sql, "reveal", clientAddress(request), 10, 60 * 60 * 1000);
    if (limit.limited) return NextResponse.json({ error: "Too many reveal attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" } });
    const contact = JSON.stringify({ fields, message, revealedAt: new Date().toISOString() });
    const rows = await sql`UPDATE gf_applications SET status = 'CONTACT AVAILABLE', revealed_contact = ${contact}::jsonb, updated_at = NOW() WHERE report_id = ${reportId} AND published = TRUE AND status IN ('SELECTED', 'CONTACT AVAILABLE') RETURNING report_id`;
    if (!rows.length) return NextResponse.json({ error: "This report is not available for contact reveal." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
