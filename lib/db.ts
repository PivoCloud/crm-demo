// Server-only PostgreSQL connection pool.
// Consumers: Server Components, Server Actions, route handlers.
// Do NOT import this module from any client-side file.
//
// Phase 1 / Plan 01 / Task 2 — Walking Skeleton.

import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  // Reuse a single Pool across HMR reloads in dev to avoid leaking connections.

  var __pivocloudPool: Pool | undefined;
}

function createPool(): Pool {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
    );
  }
  // PivoCloud managed Postgres uses an internal CA. When sslmode is requested
  // in the URL, the pg-connection-string parser otherwise forces verify-full
  // and overrides any ssl config — strip it and pass an explicit ssl object.
  const needsSSL = /[?&]sslmode=(require|verify-ca|verify-full)/i.test(raw);
  const connectionString = needsSSL
    ? raw.replace(/([?&])sslmode=[^&]+&?/i, "$1").replace(/[?&]$/, "")
    : raw;
  return new Pool({
    connectionString,
    ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
  });
}

/**
 * Lazy singleton pool getter. Reads DATABASE_URL on first call (not at module
 * load) so that `next build` does not require a live DB.
 */
export function getPool(): Pool {
  if (!globalThis.__pivocloudPool) {
    globalThis.__pivocloudPool = createPool();
  }
  return globalThis.__pivocloudPool;
}

/**
 * Parameterized SQL query. Returns rows array directly.
 *
 * Always pass parameters as `params` — never interpolate user input into `text`.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  const pool = getPool();
  const result: QueryResult<T> = await pool.query<T>(text, params as unknown[]);
  return result.rows;
}
