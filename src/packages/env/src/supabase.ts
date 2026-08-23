import { MissingEnvError, readEnv, requireEnvValues } from "./reader.js";
import { supabaseEnvSchema, supabaseFullEnvSchema } from "./schemas.js";

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export type SupabaseFullEnv = SupabaseEnv & {
  serviceRoleKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const [url, anonKey] = requireEnvValues("SUPABASE_URL", "SUPABASE_ANON_KEY");

  const parsed = supabaseEnvSchema.safeParse({ url, anonKey });
  if (!parsed.success) {
    throw new Error(
      `Variables de Supabase invalidas: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "env"} (${issue.message})`)
        .join("; ")}`,
    );
  }

  return parsed.data;
}

export function getSupabaseFullEnv(): SupabaseFullEnv {
  const [url, anonKey, serviceRoleKey] = requireEnvValues(
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  const parsed = supabaseFullEnvSchema.safeParse({
    url,
    anonKey,
    serviceRoleKey,
  });
  if (!parsed.success) {
    throw new Error(
      `Variables de Supabase invalidas: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "env"} (${issue.message})`)
        .join("; ")}`,
    );
  }

  return parsed.data;
}

export function getSupabaseServiceRoleKey(): string {
  const [serviceRoleKey] = requireEnvValues("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRoleKey) {
    throw new MissingEnvError(["SUPABASE_SERVICE_ROLE_KEY"]);
  }
  return serviceRoleKey;
}

export function readSupabaseEnv(): SupabaseEnv | null {
  const url = readEnv("SUPABASE_URL", "PUBLIC_SUPABASE_URL");
  const anonKey = readEnv(
    "SUPABASE_ANON_KEY",
    "PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_KEY",
  );

  if (!url || !anonKey) return null;

  return { url, anonKey };
}
