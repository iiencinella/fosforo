import type {
  RumEventPayload,
  RumSamplingConfig,
  RumVitalPayload,
} from "@/lib/rum-data";
import { DEFAULT_SAMPLING } from "@/lib/rum-data";
import { getSupabaseServiceClient } from "@/lib/supabase";

export const RUM_RATE_LIMIT_PER_MINUTE = 1000;
export const RUM_RATE_LIMIT_WINDOW_SECONDS = 60;

type RumEventRow = {
  id: string;
};

type RumSessionRow = {
  id: string;
  first_page_url: string | null;
  last_page_url: string | null;
  page_count: number;
  event_count: number;
};

type RumSamplingRow = {
  pageview_sampling: number;
  custom_sampling: number;
  error_sampling: number;
};

export type RumRepository = {
  insertEvent(
    payload: RumEventPayload,
    userAgentHash: string | null,
  ): Promise<string>;
  insertVital(payload: RumVitalPayload): Promise<string>;
  upsertSession(input: {
    app: string;
    sessionId: string;
    pagePath: string | null;
    eventName: string;
  }): Promise<void>;
  getSamplingConfig(app: string): Promise<RumSamplingConfig>;
  checkRateLimit(clientKey: string): Promise<boolean>;
};

// El fallback en memoria existe solo para desarrollo local sin DB.
// En produccion un fallo de DB debe propagarse como error real.
const allowMemoryFallback = !import.meta.env.PROD;

let warnedFallback = false;

function warnFallbackOnce(message: string) {
  if (!allowMemoryFallback) {
    return;
  }
  if (warnedFallback) {
    return;
  }
  warnedFallback = true;
  console.warn(`[log] ${message}`);
}

function rowToSamplingConfig(row: RumSamplingRow): RumSamplingConfig {
  return {
    pageview: Number(row.pageview_sampling),
    custom: Number(row.custom_sampling),
    error: Number(row.error_sampling),
  };
}

async function insertEventFromDb(
  payload: RumEventPayload,
  userAgentHash: string | null,
): Promise<string> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("rum_events")
    .insert({
      app: payload.app,
      event_name: payload.event_name,
      page_url: payload.page_url ?? null,
      page_path: payload.page_path ?? null,
      session_id_anon: payload.session_id_anon,
      metadata: payload.metadata ?? null,
      user_agent_hash: userAgentHash,
      app_version: payload.app_version ?? null,
      environment: payload.environment ?? null,
      timestamp: payload.timestamp ?? new Date().toISOString(),
      has_consent: payload.has_consent,
    })
    .select("id")
    .single<RumEventRow>();

  if (error || !data) {
    throw error ?? new Error("RUM_INSERT_FAILED");
  }

  return data.id;
}

async function insertVitalFromDb(payload: RumVitalPayload): Promise<string> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("rum_vitals")
    .insert({
      app: payload.app,
      page_url: payload.page_url ?? null,
      page_path: payload.page_path ?? null,
      metric_name: payload.metric_name,
      metric_value: payload.metric_value,
      rating: payload.rating,
      session_id_anon: payload.session_id_anon,
      app_version: payload.app_version ?? null,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    })
    .select("id")
    .single<RumEventRow>();

  if (error || !data) {
    throw error ?? new Error("RUM_INSERT_FAILED");
  }

  return data.id;
}

async function upsertSessionFromDb(input: {
  app: string;
  sessionId: string;
  pagePath: string | null;
  eventName: string;
}): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const now = new Date().toISOString();
  const isPageview = input.eventName === "pageview";

  const { data: existing } = await supabase
    .from("rum_sessions")
    .select("id, first_page_url, last_page_url, page_count, event_count")
    .eq("session_id_anon", input.sessionId)
    .eq("app", input.app)
    .maybeSingle<RumSessionRow>();

  if (!existing) {
    const { error } = await supabase.from("rum_sessions").insert({
      session_id_anon: input.sessionId,
      app: input.app,
      first_page_url: input.pagePath,
      last_page_url: input.pagePath,
      page_count: isPageview ? 1 : 0,
      event_count: 1,
      started_at: now,
      ended_at: now,
    });
    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await supabase
    .from("rum_sessions")
    .update({
      last_page_url: input.pagePath ?? existing.last_page_url,
      page_count: existing.page_count + (isPageview ? 1 : 0),
      event_count: existing.event_count + 1,
      ended_at: now,
    })
    .eq("id", existing.id);

  if (error) {
    throw error;
  }
}

async function getSamplingConfigFromDb(
  app: string,
): Promise<RumSamplingConfig> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("rum_sampling_config")
    .select("pageview_sampling, custom_sampling, error_sampling")
    .eq("app", app)
    .maybeSingle<RumSamplingRow>();

  if (error) {
    throw error;
  }

  // Sin fila configurada se aplican los defaults (RB-LOG-RUM-003).
  return data ? rowToSamplingConfig(data) : DEFAULT_SAMPLING;
}

async function checkRateLimitFromDb(clientKey: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.rpc("check_rum_rate_limit", {
    p_client_key: clientKey,
    p_limit: RUM_RATE_LIMIT_PER_MINUTE,
    p_window_seconds: RUM_RATE_LIMIT_WINDOW_SECONDS,
  });

  if (error) {
    throw error;
  }

  return data === true;
}

function createFallbackRepository(): RumRepository {
  return {
    async insertEvent() {
      return crypto.randomUUID();
    },
    async insertVital() {
      return crypto.randomUUID();
    },
    async upsertSession() {
      // Sin persistencia en el fallback de desarrollo local.
    },
    async getSamplingConfig() {
      return DEFAULT_SAMPLING;
    },
    async checkRateLimit() {
      // Sin limite en el fallback de desarrollo local.
      return true;
    },
  };
}

export function createRumRepository(): RumRepository {
  return {
    async insertEvent(payload, userAgentHash) {
      try {
        return await insertEventFromDb(payload, userAgentHash);
      } catch (error) {
        if (!allowMemoryFallback) {
          throw error;
        }
        warnFallbackOnce(
          `DB insertEvent failed, using memory fallback: ${String(error)}`,
        );
        return createFallbackRepository().insertEvent(payload, userAgentHash);
      }
    },
    async insertVital(payload) {
      try {
        return await insertVitalFromDb(payload);
      } catch (error) {
        if (!allowMemoryFallback) {
          throw error;
        }
        warnFallbackOnce(
          `DB insertVital failed, using memory fallback: ${String(error)}`,
        );
        return createFallbackRepository().insertVital(payload);
      }
    },
    async upsertSession(input) {
      try {
        await upsertSessionFromDb(input);
      } catch (error) {
        // El conteo de sesion es secundario: un fallo no debe romper la
        // ingesta del evento (ERM-LOG-RUM-005).
        console.warn(`[log] rum session upsert failed: ${String(error)}`);
      }
    },
    async getSamplingConfig(app) {
      try {
        return await getSamplingConfigFromDb(app);
      } catch (error) {
        if (!allowMemoryFallback) {
          // Ante fallo de DB en produccion se aplican los defaults para no
          // bloquear la ingesta por un problema transitorio de config.
          console.warn(`[log] sampling config failed: ${String(error)}`);
          return DEFAULT_SAMPLING;
        }
        warnFallbackOnce(`DB getSamplingConfig failed: ${String(error)}`);
        return DEFAULT_SAMPLING;
      }
    },
    async checkRateLimit(clientKey) {
      try {
        return await checkRateLimitFromDb(clientKey);
      } catch (error) {
        // Fail-open igual que el rate limit de logs: un problema transitorio
        // de la tabla de contadores no debe bloquear la ingesta.
        console.warn(`[log] rum rate limit check failed: ${String(error)}`);
        return true;
      }
    },
  };
}
