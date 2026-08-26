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

/**
 * Fila de horarios_temples (esquema consolidado compartido con la app
 * publica 0106_horarios).
 */
export type TempleRow = {
  id: string;
  name: string;
  city: string;
  province: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  status: "updated" | "review" | "stale";
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/** Fila de horarios_celebrations (esquema consolidado). */
export type ScheduleRow = {
  id: string;
  temple_id: string;
  type: "misa" | "adoracion" | "confesion" | "rosario" | "liturgia";
  weekday:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  start_time: string;
  duration_min: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
