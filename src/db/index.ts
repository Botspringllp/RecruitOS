import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import dns from 'dns';

// Force Node.js to use operating system's DNS lookup order (verbatim) to correctly resolve IPv6-only Supabase hosts.
dns.setDefaultResultOrder('verbatim');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing.');
}

// Connection pool for PostgreSQL client
// Note: Ensure the database user connected here is NOT a superuser/owner.
// If it is, PostgreSQL will bypass Row-Level Security (RLS) policies by default.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema });

/**
 * Executes database operations within a Postgres transaction, enforcing Row-Level Security (RLS).
 * It automatically runs `SET LOCAL app.current_agency_id` for tenant context isolation.
 * 
 * @param agencyId The UUID of the current agency (tenant context)
 * @param callback Database operations to run inside the transaction context
 */
export async function withTenantTx<T>(
  agencyId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    // Set transaction-local configuration parameter for Postgres RLS policies
    await tx.execute(sql`SELECT set_config('app.current_agency_id', ${agencyId}, true)`);
    // Run the Drizzle queries inside this isolated transaction context
    return await callback(tx as any);
  });
}
