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
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
    );
  }
  return new Pool({ connectionString });
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
