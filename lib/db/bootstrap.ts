// Idempotent DB bootstrap for the contacts table.
// Runs once per process; safe to call from any data-access function entry point.
//
// Phase 1 / Plan 01 / Task 3 — Walking Skeleton.

import { query } from "@/lib/db";

let bootstrapped = false;

/**
 * Ensure the contacts table (and required extensions) exist.
 *
 * Strictly non-destructive: only `CREATE EXTENSION IF NOT EXISTS` and
 * `CREATE TABLE IF NOT EXISTS`. No destructive DDL — Phase 1 is read-only
 * and must never mutate existing data on bootstrap.
 *
 * Idempotent via a module-level flag so HMR / repeated requests do not
 * re-issue DDL on every query.
 */
export async function ensureSchema(): Promise<void> {
  if (bootstrapped) return;

  try {
    // pgcrypto provides gen_random_uuid() on PostgreSQL 13+.
    await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
        name       text        NOT NULL,
        email      text        NOT NULL,
        phone      text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    bootstrapped = true;
  } catch (err) {
    // Log on the server, re-throw so the caller can render a degraded UI.
    console.error("[db/bootstrap] ensureSchema failed:", err);
    throw err;
  }
}
