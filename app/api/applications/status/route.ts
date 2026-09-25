import { NextRequest, NextResponse } from "next/server";
import { clientAddress, consumeRateLimit, databaseErrorResponse, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get("id")?.trim().toUpperCase() || "";
  if (!/^GF-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(reportId)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const sql = await getSql();
    const limit = await consumeRateLimit(sql, "status", clientAddress(request), 30, 60 * 1000);
    if (limit.limited) return NextResponse.json({ error: "Too many lookups. Wait a moment and try again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" } });
    const rows = await sql`SELECT report_id, status, published, created_at FROM gf_applications WHERE report_id = ${reportId} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Report not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const row = rows[0];
    return NextResponse.json({ reportId: row.report_id, status: row.status, published: Boolean(row.published), createdAt: new Date(String(row.created_at)).toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
