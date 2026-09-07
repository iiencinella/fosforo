import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseFullEnv } from "@repo/env";

export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseServiceClient() {
  const { url, serviceRoleKey } = getSupabaseFullEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
