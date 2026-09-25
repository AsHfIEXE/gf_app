import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHmac } from "node:crypto";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Application database is not configured.");
    this.name = "DatabaseUnavailableError";
  }
}

type DatabaseSql = NeonQueryFunction<false, false>;

export async function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new DatabaseUnavailableError();
  return neon(connectionString);
}

export function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
}

export async function consumeRateLimit(sql: DatabaseSql, action: string, address: string, maximum: number, windowMs: number) {
  const pepper = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  const bucketKey = createHmac("sha256", pepper).update(`gf-archive|${action}|${address}`).digest("hex");
  const rows = await sql`INSERT INTO gf_api_rate_limits (bucket_key, window_started_at, request_count)
    VALUES (${bucketKey}, NOW(), 1)
    ON CONFLICT (bucket_key) DO UPDATE SET
      request_count = CASE WHEN gf_api_rate_limits.window_started_at <= NOW() - (${windowMs} * INTERVAL '1 millisecond') THEN 1 ELSE gf_api_rate_limits.request_count + 1 END,
      window_started_at = CASE WHEN gf_api_rate_limits.window_started_at <= NOW() - (${windowMs} * INTERVAL '1 millisecond') THEN NOW() ELSE gf_api_rate_limits.window_started_at END,
      updated_at = NOW()
    RETURNING request_count, window_started_at`;
  const count = Number(rows[0]?.request_count || 1);
  if (Math.random() < 0.01) await sql`DELETE FROM gf_api_rate_limits WHERE updated_at < NOW() - INTERVAL '2 days'`;
  const resetAt = new Date(String(rows[0]?.window_started_at || Date.now())).getTime() + windowMs;
  return { limited: count > maximum, retryAfterSeconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)) };
}

export function asApplication(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    reportId: String(row.report_id),
    answers: (row.answers || {}) as Record<string, string>,
    status: String(row.status) as import("@/lib/application-store").ApplicationStatus,
    published: Boolean(row.published),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    adminNotes: String(row.admin_notes || ""),
    ratings: (row.ratings || {}) as Record<string, number>,
    revealedContact: (row.revealed_contact || undefined) as { fields: string[]; message: string; revealedAt: string } | undefined,
  };
}

export function databaseErrorResponse(error: unknown) {
  if (error instanceof DatabaseUnavailableError) {
    return Response.json({ error: "Application storage is not connected yet." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  console.error("[gf-archive] Database request failed.");
  return Response.json({ error: "The archive is temporarily unavailable. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
