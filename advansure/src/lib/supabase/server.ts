/**
 * Supabase Server Client
 *
 * Use in Route Handlers and Server Components only (never ship to the browser).
 * Uses the service-role key which bypasses Row Level Security — handle with care.
 *
 * A new client is created per request so that it can safely be used in
 * concurrent Route Handlers without shared state.
 */
import { createClient } from '@supabase/supabase-js';

export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
