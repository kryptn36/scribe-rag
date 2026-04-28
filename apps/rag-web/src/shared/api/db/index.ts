import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export type SupabaseToken = {
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  role?: string;
};

// Wrapper for Drizzle queries to respect Supabase Row Level Security (RLS)
// Use this in Server Components/Actions when making queries for a specific authenticated user
export function createDrizzle(token: SupabaseToken) {
  return {
    admin: db, // Admin client bypasses RLS
    rls: (async (transaction, ...rest) => {
      return await db.transaction(
        async (tx) => {
          try {
            await tx.execute(sql`
          select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);
          select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? '')}', TRUE);
          set local role ${sql.raw(token.role ?? 'anon')};
          `);
            return await transaction(tx);
          } finally {
            await tx.execute(sql`
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
            `);
          }
        },
        ...rest
      );
    }) as typeof db.transaction,
  };
}
