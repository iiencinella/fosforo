import { z } from "zod";
import type { LogEntry, LogFilters, LogLevel } from "@/lib/log-data";
import {
  getAlertSummary,
  getDashboardMetrics,
  getMockLogs,
  getHourlySeries,
  logIngestPayloadSchema,
  queryLogs,
} from "@/lib/log-data";
import { getSupabaseServiceClient } from "@/lib/supabase";

type LogRow = {
  id: string;
  app: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata: Record<string, unknown> | null;
  stack_trace: string | null;
  app_version: string | null;
  environment: string | null;
};

type ApiKeyRow = {
  id: string;
  key_hash: string;
  app_name: string;
  is_active: boolean;
};

export type LogIngestPayload = z.infer<typeof logIngestPayloadSchema>;

type LogRepository = {
  list(filters: LogFilters): Promise<ReturnType<typeof queryLogs>>;
  getById(id: string): Promise<LogEntry | null>;
  insert(payload: LogIngestPayload, apiKeyHash: string): Promise<LogEntry>;
  verifyApiKey(apiKeyHash: string): Promise<ApiKeyRow | null>;
  metrics(): Promise<{
    metrics: ReturnType<typeof getDashboardMetrics>;
    hourlySeries: ReturnType<typeof getHourlySeries>;
    alerts: ReturnType<typeof getAlertSummary>;
  }>;
};

function mapRowToLogEntry(row: LogRow): LogEntry {
  return {
    id: row.id,
    app: row.app,
    level: row.level,
    message: row.message,
    timestamp: row.timestamp,
    metadata: row.metadata ?? undefined,
    stack_trace: row.stack_trace ?? undefined,
    app_version: row.app_version ?? undefined,
    environment: row.environment ?? undefined,
  };
}

const fallbackLogs: LogEntry[] = getMockLogs();
const LOCAL_DEV_API_KEY_HASH =
  "218a5c7eac0214246106fbf58a961a06c473a752056912befd1dc29f39f6d739";

let warnedFallback = false;

function warnFallbackOnce(message: string) {
  if (warnedFallback) {
    return;
  }
  warnedFallback = true;
  console.warn(`[log] ${message}`);
}

async function listFromDb(filters: LogFilters) {
  const supabase = getSupabaseServiceClient();
  let query = supabase
    .from("log_entries")
    .select(
      "id, app, level, message, timestamp, metadata, stack_trace, app_version, environment",
      { count: "exact" },
    )
    .order("timestamp", { ascending: false });

  if (filters.level) {
    query = query.eq("level", filters.level);
  }

  if (filters.app) {
    query = query.eq("app", filters.app);
  }

  if (filters.search) {
    query = query.ilike("message", `%${filters.search}%`);
  }

  if (filters.since) {
    query = query.gte("timestamp", filters.since);
  }

  if (filters.until) {
    query = query.lte("timestamp", filters.until);
  }

  const from =
    (Math.max(1, filters.page ?? 1) - 1) *
    Math.min(50, Math.max(1, filters.limit ?? 50));
  const to = from + Math.min(50, Math.max(1, filters.limit ?? 50)) - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) {
    throw error;
  }

  const rows = (data ?? []) as LogRow[];
  return {
    data: rows.map(mapRowToLogEntry),
    total: count ?? rows.length,
    page: Math.max(1, filters.page ?? 1),
    limit: Math.min(50, Math.max(1, filters.limit ?? 50)),
  };
}

async function getByIdFromDb(id: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("log_entries")
    .select(
      "id, app, level, message, timestamp, metadata, stack_trace, app_version, environment",
    )
    .eq("id", id)
    .single<LogRow>();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data ? mapRowToLogEntry(data) : null;
}

async function insertFromDb(payload: LogIngestPayload, apiKeyHash: string) {
  const supabase = getSupabaseServiceClient();
  const key = await verifyApiKeyFromDb(apiKeyHash);
  if (!key || !key.is_active) {
    throw new Error("LOG_INVALID_API_KEY");
  }

  const insertPayload = {
    app: payload.app,
    level: payload.level,
    message: payload.message,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    metadata: payload.metadata ?? null,
    stack_trace: payload.stack_trace ?? null,
    app_version: payload.app_version ?? null,
    environment: payload.environment ?? null,
    ingested_by: key.id,
  };

  const { data, error } = await supabase
    .from("log_entries")
    .insert(insertPayload)
    .select(
      "id, app, level, message, timestamp, metadata, stack_trace, app_version, environment",
    )
    .single<LogRow>();

  if (error || !data) {
    throw error ?? new Error("LOG_INSERT_FAILED");
  }

  return mapRowToLogEntry(data);
}

async function verifyApiKeyFromDb(apiKeyHash: string) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, key_hash, app_name, is_active")
    .eq("key_hash", apiKeyHash)
    .single<ApiKeyRow>();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data ?? null;
}

async function metricsFromDb() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("log_entries")
    .select(
      "id, app, level, message, timestamp, metadata, stack_trace, app_version, environment",
    )
    .order("timestamp", { ascending: false });

  if (error) {
    throw error;
  }

  const logs = ((data ?? []) as LogRow[]).map(mapRowToLogEntry);
  return {
    metrics: getDashboardMetrics(logs),
    hourlySeries: getHourlySeries(logs, 24),
    alerts: getAlertSummary(logs),
  };
}

function createFallbackRepository(): LogRepository {
  return {
    async list(filters) {
      return queryLogs(fallbackLogs, filters);
    },
    async getById(id) {
      return fallbackLogs.find((item) => item.id === id) ?? null;
    },
    async insert(payload) {
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        app: payload.app,
        level: payload.level,
        message: payload.message,
        timestamp: payload.timestamp ?? new Date().toISOString(),
        metadata: payload.metadata,
        stack_trace: payload.stack_trace,
        app_version: payload.app_version,
        environment: payload.environment,
      };
      fallbackLogs.unshift(entry);
      return entry;
    },
    async verifyApiKey(_apiKeyHash) {
      if (_apiKeyHash === LOCAL_DEV_API_KEY_HASH) {
        return {
          id: "00000000-0000-0000-0000-000000000001",
          key_hash: LOCAL_DEV_API_KEY_HASH,
          app_name: "log-dev-client",
          is_active: true,
        };
      }
      return null;
    },
    async metrics() {
      return {
        metrics: getDashboardMetrics(fallbackLogs),
        hourlySeries: getHourlySeries(fallbackLogs, 24),
        alerts: getAlertSummary(fallbackLogs),
      };
    },
  };
}

export function createLogRepository(): LogRepository {
  return {
    async list(filters) {
      try {
        return await listFromDb(filters);
      } catch (error) {
        warnFallbackOnce(
          `DB list failed, using memory fallback: ${String(error)}`,
        );
        return createFallbackRepository().list(filters);
      }
    },
    async getById(id) {
      try {
        return await getByIdFromDb(id);
      } catch (error) {
        warnFallbackOnce(
          `DB getById failed, using memory fallback: ${String(error)}`,
        );
        return createFallbackRepository().getById(id);
      }
    },
    async insert(payload, apiKeyHash) {
      try {
        return await insertFromDb(payload, apiKeyHash);
      } catch (error) {
        if (error instanceof Error && error.message === "LOG_INVALID_API_KEY") {
          throw error;
        }
        warnFallbackOnce(
          `DB insert failed, using memory fallback: ${String(error)}`,
        );
        return createFallbackRepository().insert(payload, apiKeyHash);
      }
    },
    async verifyApiKey(apiKeyHash) {
      try {
        return await verifyApiKeyFromDb(apiKeyHash);
      } catch (error) {
        warnFallbackOnce(`DB verifyApiKey failed: ${String(error)}`);
        return createFallbackRepository().verifyApiKey(apiKeyHash);
      }
    },
    async metrics() {
      try {
        return await metricsFromDb();
      } catch (error) {
        warnFallbackOnce(
          `DB metrics failed, using memory fallback: ${String(error)}`,
        );
        return createFallbackRepository().metrics();
      }
    },
  };
}
