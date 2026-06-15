/**
 * Drizzle ORM client — server-only.
 *
 * Uses the `postgres` driver (not pooled) so that Drizzle can run prepared
 * statements and transactions without the pgBouncer limitation.
 * Import only from Server Components, Route Handlers, or server actions.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// DATABASE_URL must be a direct (non-pooled) Postgres connection string.
// For Supabase: use the connection string from Project Settings → Database → URI
// (Session Mode / Direct connection, port 5432).
const connectionString = process.env.DATABASE_URL!;

// prepare: false is required when using Supabase's transaction-mode pooler
// (port 6543). For direct connections it is a no-op but kept for consistency.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
