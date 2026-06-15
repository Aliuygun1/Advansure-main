/**
 * Supabase Browser Client
 *
 * Use in Client Components and browser-side code only.
 * Primarily used for Storage uploads (TU-03: video upload from device camera).
 *
 * Never use the service-role key here — it would be exposed to the browser.
 */
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
