import { NextResponse } from "next/server";
import { databaseErrorResponse, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = await getSql();
    const rows = await sql`SELECT report_id FROM gf_applications WHERE published = TRUE AND status IN ('SELECTED', 'CONTACT AVAILABLE') ORDER BY updated_at DESC`;
    return NextResponse.json({ ids: rows.map((row) => row.report_id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
