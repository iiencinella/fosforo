import { z } from "zod";

export const logLevelSchema = z.enum([
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
]);

export type LogLevel = z.infer<typeof logLevelSchema>;

export type LogEntry = {
  id: string;
  app: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  stack_trace?: string;
  app_version?: string;
  environment?: string;
};

export const logIngestPayloadSchema = z.object({
  app: z.string().trim().min(1).max(100),
  level: logLevelSchema,
  message: z.string().trim().min(1).max(4000),
  timestamp: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid timestamp",
    }),
  metadata: z.record(z.string(), z.unknown()).optional(),
  stack_trace: z.string().max(12000).optional(),
  app_version: z.string().max(20).optional(),
  environment: z.string().max(20).optional(),
});

const seededLogs: LogEntry[] = [
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc001",
    app: "portal",
    level: "error",
    message: "Connection timeout fetching novedades feed",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    metadata: { route: "/novedades", durationMs: 5120, statusCode: 504 },
    stack_trace: "Error: timeout\n  at fetchNewsFeed (/src/lib/news.ts:74:11)",
    app_version: "0.0.1",
    environment: "production",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc002",
    app: "biblia",
    level: "warn",
    message: "Fallback translation applied for verse lookup",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    metadata: { verse: "Jn 3:16", fallbackVersion: "RVA" },
    app_version: "0.0.1",
    environment: "production",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc003",
    app: "calendario",
    level: "info",
    message: "Daily liturgy payload generated",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metadata: { source: "calendar-service", entries: 14 },
    app_version: "0.0.1",
    environment: "production",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc004",
    app: "usuario",
    level: "fatal",
    message: "Unhandled exception while refreshing session",
    timestamp: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
    metadata: { endpoint: "/api/auth/session", userId: "user_482" },
    stack_trace:
      "TypeError: Cannot read properties of undefined\n  at refreshSession (/src/lib/session.ts:119:18)",
    app_version: "0.0.1",
    environment: "production",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc005",
    app: "portal",
    level: "debug",
    message: "Homepage hero metrics recomputed",
    timestamp: new Date(Date.now() - 1000 * 60 * 43).toISOString(),
    metadata: { metrics: ["apps", "novedades"] },
    app_version: "0.0.1",
    environment: "staging",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc006",
    app: "misal",
    level: "error",
    message: "PDF renderer failed to open source document",
    timestamp: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    metadata: { source: "misal_2026_05.pdf", retryable: true },
    stack_trace: "Error: file not found\n  at loadPdf (/src/lib/pdf.ts:33:7)",
    app_version: "0.0.1",
    environment: "production",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc007",
    app: "oraciones",
    level: "info",
    message: "Prayer request stored successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    metadata: { requestId: "req-18", channel: "web" },
    app_version: "0.0.1",
    environment: "production",
  },
  {
    id: "f3f7f62f-1d45-4b6d-b6f0-a8f34b0dc008",
    app: "portal",
    level: "error",
    message: "Search index unavailable",
    timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    metadata: { endpoint: "/api/search", statusCode: 503 },
    stack_trace:
      "Error: search backend unavailable\n  at querySearch (/src/lib/search.ts:52:10)",
    app_version: "0.0.1",
    environment: "production",
  },
];

function byNewest(a: LogEntry, b: LogEntry) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

export function getMockLogs(): LogEntry[] {
  return [...seededLogs].sort(byNewest);
}

export function addMockLog(
  payload: z.infer<typeof logIngestPayloadSchema>,
): LogEntry {
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

  seededLogs.unshift(entry);
  return entry;
}

export type LogFilters = {
  page?: number;
  limit?: number;
  level?: LogLevel;
  app?: string;
  search?: string;
  since?: string;
  until?: string;
};

export function filterLogs(logs: LogEntry[], filters: LogFilters): LogEntry[] {
  return queryLogs(logs, filters).data;
}

export function queryLogs(
  logs: LogEntry[],
  filters: LogFilters,
): {
  data: LogEntry[];
  total: number;
  page: number;
  limit: number;
} {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 50));

  const filtered = logs.filter((item) => {
    if (filters.level && item.level !== filters.level) {
      return false;
    }

    if (filters.app && item.app !== filters.app) {
      return false;
    }

    if (filters.search) {
      const needle = filters.search.toLowerCase();
      const haystack =
        `${item.message} ${JSON.stringify(item.metadata ?? {})}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }

    if (filters.since) {
      const sinceMs = new Date(filters.since).getTime();
      if (
        Number.isFinite(sinceMs) &&
        new Date(item.timestamp).getTime() < sinceMs
      ) {
        return false;
      }
    }

    if (filters.until) {
      const untilMs = new Date(filters.until).getTime();
      if (
        Number.isFinite(untilMs) &&
        new Date(item.timestamp).getTime() > untilMs
      ) {
        return false;
      }
    }

    return true;
  });

  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export function getLogById(id: string): LogEntry | null {
  return seededLogs.find((item) => item.id === id) ?? null;
}

export function getDashboardMetrics(logs: LogEntry[]) {
  const totalLogs = logs.length;

  const now = Date.now();
  const last24h = logs.filter(
    (item) => now - new Date(item.timestamp).getTime() <= 24 * 60 * 60 * 1000,
  );
  const errorCount24h = last24h.filter(
    (item) => item.level === "error" || item.level === "fatal",
  ).length;

  const byApp = new Map<string, number>();
  for (const item of logs) {
    byApp.set(item.app, (byApp.get(item.app) ?? 0) + 1);
  }

  const topApps = [...byApp.entries()]
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const errorRate = totalLogs > 0 ? (errorCount24h / totalLogs) * 100 : 0;

  return {
    totalLogs,
    errorCount24h,
    errorRate,
    topApps,
  };
}

export function getHourlySeries(logs: LogEntry[], hours = 24) {
  const now = Date.now();
  const buckets = Array.from({ length: hours }, (_, index) => {
    const from = now - (hours - index) * 60 * 60 * 1000;
    const to = from + 60 * 60 * 1000;

    const count = logs.filter((item) => {
      const ts = new Date(item.timestamp).getTime();
      return ts >= from && ts < to;
    }).length;

    return {
      label: new Date(from).toISOString().slice(11, 16),
      count,
    };
  });

  return buckets;
}

export function getAlertSummary(logs: LogEntry[]) {
  const now = Date.now();
  const lastMinute = logs.filter(
    (item) => now - new Date(item.timestamp).getTime() <= 60 * 1000,
  );

  const errorsByApp = new Map<string, number>();
  for (const item of lastMinute) {
    if (item.level !== "error" && item.level !== "fatal") {
      continue;
    }
    errorsByApp.set(item.app, (errorsByApp.get(item.app) ?? 0) + 1);
  }

  const threshold = 10;
  const triggered = [...errorsByApp.entries()]
    .filter(([, count]) => count > threshold)
    .map(([app, count]) => ({ app, count }));

  return {
    threshold,
    triggered,
  };
}

export const apiKeySchema = z
  .string()
  .trim()
  .min(8, "Invalid or missing API key");

export function formatLogMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string {
  return JSON.stringify(metadata ?? {}, null, 2);
}
