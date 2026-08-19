import { getSupabaseEnv } from "@repo/env";
import { createClient } from "@supabase/supabase-js";

const { url, anonKey } = getSupabaseEnv();

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
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
