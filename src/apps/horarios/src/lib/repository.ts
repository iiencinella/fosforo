import { CELEBRATIONS, TEMPLES } from "@/lib/data";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type {
  CelebrationRecord,
  RepositoryHealth,
  SearchDataSource,
  SearchEventPayload,
  TempleRecord,
} from "@/types/horarios";

type TempleRow = {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  status: "updated" | "review" | "stale";
  contact_phone: string | null;
  contact_whatsapp: string | null;
  notes: string | null;
};

type CelebrationRow = {
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
};

type SearchEventInsertRow = {
  session_id: string;
  query: string;
  city: string | null;
  celebration_type: string | null;
  time_range: string | null;
  sort: string;
  results_count: number;
};

let warnedFallback = false;
const fallbackEvents: SearchEventPayload[] = [];

function warnFallbackOnce(message: string) {
  if (warnedFallback) {
    return;
  }
  warnedFallback = true;
  console.warn(`[horarios] ${message}`);
}

function mapTempleRow(row: TempleRow): TempleRecord {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    province: row.province,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    status: row.status,
    contactPhone: row.contact_phone ?? undefined,
    contactWhatsApp: row.contact_whatsapp ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapCelebrationRow(row: CelebrationRow): CelebrationRecord {
  return {
    id: row.id,
    templeId: row.temple_id,
    type: row.type,
    weekday: row.weekday,
    startTime: row.start_time,
    durationMin: row.duration_min,
    notes: row.notes ?? undefined,
  };
}

async function loadFromDb(): Promise<SearchDataSource> {
  const supabase = getSupabaseServiceClient();
  const [templesResult, celebrationsResult] = await Promise.all([
    supabase
      .from("horarios_temples")
      .select(
        "id,name,city,province,address,lat,lng,status,contact_phone,contact_whatsapp,notes",
      )
      .eq("is_active", true)
      .order("city", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("horarios_celebrations")
      .select("id,temple_id,type,weekday,start_time,duration_min,notes")
      .eq("is_active", true),
  ]);

  if (templesResult.error) {
    throw templesResult.error;
  }

  if (celebrationsResult.error) {
    throw celebrationsResult.error;
  }

  return {
    temples: (templesResult.data ?? []).map((row) =>
      mapTempleRow(row as TempleRow),
    ),
    celebrations: (celebrationsResult.data ?? []).map((row) =>
      mapCelebrationRow(row as CelebrationRow),
    ),
  };
}

function loadFallbackData(): SearchDataSource {
  return {
    temples: TEMPLES,
    celebrations: CELEBRATIONS,
  };
}

async function insertSearchEventDb(payload: SearchEventPayload) {
  const supabase = getSupabaseServiceClient();
  const insertRow: SearchEventInsertRow = {
    session_id: payload.sessionId,
    query: payload.query,
    city: payload.filters.city ?? null,
    celebration_type: payload.filters.type ?? null,
    time_range: payload.filters.range ?? null,
    sort: payload.filters.sort,
    results_count: payload.resultsCount,
  };

  const { error } = await supabase
    .from("horarios_search_events")
    .insert(insertRow);
  if (error) {
    throw error;
  }
}

async function countSearchEventsDb(): Promise<number> {
  const supabase = getSupabaseServiceClient();
  const { count, error } = await supabase
    .from("horarios_search_events")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getSearchDataSource(): Promise<SearchDataSource> {
  try {
    return await loadFromDb();
  } catch (error) {
    warnFallbackOnce(
      `No se pudo usar Supabase, se aplica fallback local: ${String(error)}`,
    );
    return loadFallbackData();
  }
}

export async function trackSearchEvent(
  payload: SearchEventPayload,
): Promise<void> {
  try {
    await insertSearchEventDb(payload);
    return;
  } catch (error) {
    warnFallbackOnce(
      `No se pudo registrar evento en Supabase: ${String(error)}`,
    );
  }

  fallbackEvents.push(payload);
  if (fallbackEvents.length > 200) {
    fallbackEvents.shift();
  }
}

export async function getRepositoryHealth(): Promise<RepositoryHealth> {
  try {
    const [source, eventCount] = await Promise.all([
      loadFromDb(),
      countSearchEventsDb(),
    ]);
    return {
      source: "database",
      templeCount: source.temples.length,
      celebrationCount: source.celebrations.length,
      searchEventCount: eventCount,
    };
  } catch {
    const fallback = loadFallbackData();
    return {
      source: "fallback",
      templeCount: fallback.temples.length,
      celebrationCount: fallback.celebrations.length,
      searchEventCount: fallbackEvents.length,
    };
  }
}
