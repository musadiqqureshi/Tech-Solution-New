#!/usr/bin/env node
/**
 * Apply supabase/schema.sql to the Supabase Postgres database (idempotent).
 *
 * Usage:
 *   SUPABASE_DB_URL=postgres://... npm run setup:db
 * (SUPABASE_DB_URL is read from .env.local automatically if present.)
 */
import { readFileSync } from "node:fs";
import pg from "pg";

function loadDotEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env))
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* ignore */
  }
}
loadDotEnv();

const DB_URL = process.env.SUPABASE_DB_URL;
if (!DB_URL) {
  console.error("✗ Missing SUPABASE_DB_URL (the non-pooling Postgres connection string).");
  process.exit(1);
}

const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

const client = new pg.Client({
  connectionString: DB_URL.replace(/\?.*$/, ""), // drop sslmode= so our ssl opts win
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("\n▲ Applying schema to Supabase Postgres…\n");
  await client.connect();
  await client.query(sql);
  console.log("✓ Schema applied (tables, RLS policies, is_admin()).\n");
} catch (e) {
  console.error("✗ Schema failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
