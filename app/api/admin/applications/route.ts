import { NextRequest, NextResponse } from "next/server";
import { adminStatuses } from "@/lib/application-validation";
import { asApplication, databaseErrorResponse, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedStatus = params.get("status") || "ALL";
  if (requestedStatus !== "ALL" && !adminStatuses.includes(requestedStatus as typeof adminStatuses[number])) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }
  const search = (params.get("q") || "").trim().slice(0, 120);
  const limit = Math.max(1, Math.min(50, Number(params.get("limit")) || 25));
  const offset = Math.max(0, Math.min(100_000, Number(params.get("offset")) || 0));
  const sort = params.get("sort");
  try {
    const sql = await getSql();
    const rows = sort === "OLDEST"
      ? await sql`SELECT id, report_id, answers, status, published, created_at, updated_at, admin_notes, ratings FROM gf_applications WHERE (${requestedStatus} = 'ALL' OR status = ${requestedStatus}) AND (${search} = '' OR report_id ILIKE ${`%${search}%`} OR answers::text ILIKE ${`%${search}%`} OR admin_notes ILIKE ${`%${search}%`}) ORDER BY created_at ASC LIMIT ${limit} OFFSET ${offset}`
      : sort === "RATING"
        ? await sql`SELECT id, report_id, answers, status, published, created_at, updated_at, admin_notes, ratings FROM gf_applications WHERE (${requestedStatus} = 'ALL' OR status = ${requestedStatus}) AND (${search} = '' OR report_id ILIKE ${`%${search}%`} OR answers::text ILIKE ${`%${search}%`} OR admin_notes ILIKE ${`%${search}%`}) ORDER BY COALESCE((ratings->>'Overall interest')::int, 0) DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`
        : await sql`SELECT id, report_id, answers, status, published, created_at, updated_at, admin_notes, ratings FROM gf_applications WHERE (${requestedStatus} = 'ALL' OR status = ${requestedStatus}) AND (${search} = '' OR report_id ILIKE ${`%${search}%`} OR answers::text ILIKE ${`%${search}%`} OR admin_notes ILIKE ${`%${search}%`}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const totals = await sql`SELECT status, COUNT(*)::int AS count FROM gf_applications GROUP BY status`;
    const counts: Record<string, number> = Object.fromEntries(adminStatuses.map((status) => [status, 0]));
    for (const row of totals) counts[String(row.status)] = Number(row.count);
    const countRows = await sql`SELECT COUNT(*)::int AS count FROM gf_applications WHERE (${requestedStatus} = 'ALL' OR status = ${requestedStatus}) AND (${search} = '' OR report_id ILIKE ${`%${search}%`} OR answers::text ILIKE ${`%${search}%`} OR admin_notes ILIKE ${`%${search}%`})`;
    return NextResponse.json({ applications: rows.map(asApplication), counts, total: Number(countRows[0]?.count || 0), limit, offset }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
