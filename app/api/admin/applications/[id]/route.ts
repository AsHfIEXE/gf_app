import { NextRequest, NextResponse } from "next/server";
import { adminRatingLabels, adminStatuses } from "@/lib/application-validation";
import { asApplication, databaseErrorResponse, getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  try {
    const sql = await getSql();
    const rows = await sql`SELECT * FROM gf_applications WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Report not found." }, { status: 404 });
    return NextResponse.json({ application: asApplication(rows[0]) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Request origin could not be verified." }, { status: 403 });
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Update could not be read." }, { status: 400 }); }

  const hasStatus = Object.hasOwn(body, "status");
  const hasPublished = Object.hasOwn(body, "published");
  const hasNotes = Object.hasOwn(body, "adminNotes");
  const hasRatings = Object.hasOwn(body, "ratings");
  if (!hasStatus && !hasPublished && !hasNotes && !hasRatings) return NextResponse.json({ error: "No valid changes supplied." }, { status: 400 });
  if (hasStatus && !adminStatuses.includes(body.status as typeof adminStatuses[number])) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  if (hasPublished && typeof body.published !== "boolean") return NextResponse.json({ error: "Invalid announcement setting." }, { status: 400 });
  if (hasNotes && (typeof body.adminNotes !== "string" || body.adminNotes.length > 20_000)) return NextResponse.json({ error: "Admin notes are too long or invalid." }, { status: 400 });
  const ratings = body.ratings;
  if (hasRatings && (!ratings || typeof ratings !== "object" || Array.isArray(ratings) || Object.entries(ratings).some(([label, value]) => !adminRatingLabels.includes(label as typeof adminRatingLabels[number]) || !Number.isInteger(value) || Number(value) < 1 || Number(value) > 5))) {
    return NextResponse.json({ error: "One or more assessment ratings are invalid." }, { status: 400 });
  }

  try {
    const sql = await getSql();
    const existing = await sql`SELECT status FROM gf_applications WHERE id = ${id} LIMIT 1`;
    if (!existing.length) return NextResponse.json({ error: "Report not found." }, { status: 404 });
    const nextStatus = hasStatus ? String(body.status) : String(existing[0].status);
    if (hasPublished && body.published && !["SELECTED", "CONTACT AVAILABLE"].includes(nextStatus)) {
      return NextResponse.json({ error: "Only selected reports can be announced." }, { status: 409 });
    }
    const ratingJson = JSON.stringify(hasRatings ? ratings : {});
    const rows = await sql`UPDATE gf_applications SET
      status = CASE WHEN ${hasStatus} THEN ${hasStatus ? body.status as string : null} ELSE status END,
      published = CASE WHEN ${hasPublished} THEN ${Boolean(body.published)} WHEN ${hasStatus && !["SELECTED", "CONTACT AVAILABLE"].includes(nextStatus)} THEN FALSE ELSE published END,
      admin_notes = CASE WHEN ${hasNotes} THEN ${hasNotes ? body.adminNotes as string : null} ELSE admin_notes END,
      ratings = ratings || ${ratingJson}::jsonb,
      updated_at = NOW()
      WHERE id = ${id} RETURNING *`;
    if (!rows.length) return NextResponse.json({ error: "Report not found." }, { status: 404 });
    return NextResponse.json({ application: asApplication(rows[0]) }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return databaseErrorResponse(error);
  }
}
