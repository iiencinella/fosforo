import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv, getSupabaseServiceRoleKey } from "@repo/env";

let client: SupabaseClient | undefined;

export function getPortalSupabaseServerClient(): SupabaseClient {
  if (client) return client;

  client = createClient(
    requireEnv("SUPABASE_URL", "PUBLIC_SUPABASE_URL"),
    getSupabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  return client;
}
