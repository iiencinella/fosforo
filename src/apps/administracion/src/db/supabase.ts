import { getSupabaseEnv } from "@repo/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!cachedClient) {
    const { url, anonKey } = getSupabaseEnv();
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedClient;
}

/**
 * Cliente Supabase con inicializacion perezosa.
 * Nunca instanciar a nivel de modulo: si falta una variable de entorno,
 * el error debe ocurrir recien cuando se usa el cliente y no romper
 * todo el bundle con un 500 global.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export type AdminRole = "admin" | "editor" | "viewer";

export type ChurchRow = {
  id: string;
  name: string;
  address: string | null;
  city: string;
  province: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type ScheduleRow = {
  id: string;
  church_id: string;
  celebration_type: string;
  weekday: number;
  start_time: string;
  valid_from: string | null;
  valid_to: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
