import { readFile } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL before migrating.");

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(71208431)");
  await client.query("CREATE TABLE IF NOT EXISTS gf_schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  const version = "001_initial";
  const existing = await client.query("SELECT version FROM gf_schema_migrations WHERE version = $1", [version]);
  if (existing.rowCount === 0) {
    const migration = await readFile(new URL(`../db/migrations/${version}.sql`, import.meta.url), "utf8");
    await client.query(migration);
    await client.query("INSERT INTO gf_schema_migrations (version) VALUES ($1)", [version]);
    console.log(`Applied database migration ${version}.`);
  } else {
    console.log(`Database migration ${version} is already applied.`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
