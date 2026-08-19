import { readEnv, requireEnv } from "./reader.js";

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseFullEnv = SupabaseEnv & {
  serviceRoleKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const url = requireEnv("SUPABASE_URL", "PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv(
    "SUPABASE_ANON_KEY",
    "SUPABASE_KEY",
    "PUBLIC_SUPABASE_ANON_KEY",
  );

  return { url, anonKey };
}

export function getSupabaseFullEnv(): SupabaseFullEnv {
  const base = getSupabaseEnv();
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return { ...base, serviceRoleKey };
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = readEnv("SUPABASE_URL", "PUBLIC_SUPABASE_URL");
  const anonKey = readEnv(
    "SUPABASE_ANON_KEY",
    "SUPABASE_KEY",
    "PUBLIC_SUPABASE_ANON_KEY",
  );

  if (!url || !anonKey) return null;

  return { url, anonKey };
}
