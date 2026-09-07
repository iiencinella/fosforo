import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Metricas agregadas para el dashboard de producto RUM (FR-LOG-RUM-005).
 * Las agregaciones corren en Postgres via RPC (NFR-0105-LOG-003); este
 * modulo solo mapea filas y provee builders puros testables.
 */

export const PRODUCT_DASHBOARD_ROLES = ["dev", "ops", "product"] as const;

export const HOURS_MAX = 168; // 7 dias
export const DAYS_MAX = 90;

export const topPagesParamsSchema = z.object({
  app: z.string().max(100).optional(),
  hours: z.coerce.number().int().min(1).max(HOURS_MAX).default(168),
});

export const vitalsParamsSchema = topPagesParamsSchema;

export const eventsByAppParamsSchema = z.object({
  hours: z.coerce.number().int().min(1).max(HOURS_MAX).default(168),
});

export const funnelParamsSchema = z.object({
  app: z.string().max(100).optional(),
  hours: z.coerce.number().int().min(1).max(HOURS_MAX).default(168),
  events: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .refine((events) => events.length >= 2 && events.length <= 5, {
      message: "Funnel requiere entre 2 y 5 eventos",
    }),
});

export const retentionParamsSchema = z.object({
  app: z.string().max(100).optional(),
  days: z.coerce.number().int().min(1).max(DAYS_MAX).default(30),
});

export type RumTopPageRow = { page_path: string; count: number };
export type RumVitalsDistributionRow = {
  metric_name: "LCP" | "INP" | "CLS";
  rating: "good" | "needs-improvement" | "poor";
  count: number;
};
export type RumEventByAppRow = { app: string; count: number };
export type RumDailySessionRow = {
  day: string;
  sessions: number;
  pageviews: number;
};
export type RumFunnelCountRow = { event_name: string; sessions: number };

export type FunnelStep = {
  step: number;
  event_name: string;
  sessions: number;
  pctOfFirst: number;
  pctOfPrev: number;
  dropoff: number;
};

/**
 * Builder puro de embudo: convierte conteos por evento en pasos con
 * porcentajes sobre el primer paso y sobre el paso previo, y dropoff.
 */
export function buildFunnel(
  events: string[],
  counts: RumFunnelCountRow[],
): FunnelStep[] {
  const countByEvent = new Map(
    counts.map((row) => [row.event_name, Number(row.sessions)]),
  );
  const firstSessions = countByEvent.get(events[0] ?? "") ?? 0;
  let previous = firstSessions;

  return events.map((eventName, index) => {
    const sessions = countByEvent.get(eventName) ?? 0;
    const step: FunnelStep = {
      step: index + 1,
      event_name: eventName,
      sessions,
      pctOfFirst:
        firstSessions > 0
          ? Math.round((sessions / firstSessions) * 1000) / 10
          : 0,
      pctOfPrev:
        previous > 0 ? Math.round((sessions / previous) * 1000) / 10 : 0,
      dropoff: Math.max(0, previous - sessions),
    };
    previous = sessions;
    return step;
  });
}

/**
 * Porcentaje de muestras "good" por metrica (para las cards del panel).
 */
export function buildVitalsSummary(
  rows: RumVitalsDistributionRow[],
): Array<{ metric_name: string; goodPct: number; total: number }> {
  const byMetric = new Map<string, { good: number; total: number }>();
  for (const row of rows) {
    const entry = byMetric.get(row.metric_name) ?? { good: 0, total: 0 };
    entry.total += Number(row.count);
    if (row.rating === "good") {
      entry.good += Number(row.count);
    }
    byMetric.set(row.metric_name, entry);
  }
  return Array.from(byMetric.entries()).map(([metric, entry]) => ({
    metric_name: metric,
    total: entry.total,
    goodPct:
      entry.total > 0 ? Math.round((entry.good / entry.total) * 1000) / 10 : 0,
  }));
}

const allowMemoryFallback = !import.meta.env.PROD;

function warnFallbackOnce(message: string): void {
  if (!allowMemoryFallback) {
    return;
  }
  console.warn(`[log] ${message}`);
}

type RpcRow = Record<string, unknown>;

async function rpcOrEmpty(
  functionName: string,
  params: Record<string, unknown>,
  warnLabel: string,
): Promise<RpcRow[]> {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) {
      throw error;
    }
    return (data ?? []) as RpcRow[];
  } catch (error) {
    if (!allowMemoryFallback) {
      throw error;
    }
    warnFallbackOnce(`${warnLabel} failed: ${String(error)}`);
    return [];
  }
}

export async function getTopPages(
  hours: number,
  app?: string,
): Promise<RumTopPageRow[]> {
  const rows = await rpcOrEmpty(
    "get_rum_top_pages",
    { p_hours: hours, p_app: app ?? null },
    "rum top pages",
  );
  return rows.map((row) => ({
    page_path: String(row.page_path ?? ""),
    count: Number(row.event_count ?? 0),
  }));
}

export async function getVitalsDistribution(
  hours: number,
  app?: string,
): Promise<RumVitalsDistributionRow[]> {
  const rows = await rpcOrEmpty(
    "get_rum_vitals_distribution",
    { p_hours: hours, p_app: app ?? null },
    "rum vitals distribution",
  );
  return rows.map((row) => ({
    metric_name: String(row.metric_name ?? "") as "LCP" | "INP" | "CLS",
    rating: String(row.rating ?? "") as "good" | "needs-improvement" | "poor",
    count: Number(row.sample_count ?? 0),
  }));
}

export async function getEventsByApp(
  hours: number,
): Promise<RumEventByAppRow[]> {
  const rows = await rpcOrEmpty(
    "get_rum_events_by_app",
    { p_hours: hours },
    "rum events by app",
  );
  return rows.map((row) => ({
    app: String(row.app ?? ""),
    count: Number(row.event_count ?? 0),
  }));
}

export async function getFunnelCounts(
  events: string[],
  hours: number,
  app?: string,
): Promise<RumFunnelCountRow[]> {
  const rows = await rpcOrEmpty(
    "get_rum_funnel",
    { p_events: events, p_hours: hours, p_app: app ?? null },
    "rum funnel",
  );
  return rows.map((row) => ({
    event_name: String(row.event_name ?? ""),
    sessions: Number(row.sessions ?? 0),
  }));
}

export async function getDailySessions(
  days: number,
  app?: string,
): Promise<RumDailySessionRow[]> {
  const rows = await rpcOrEmpty(
    "get_rum_daily_sessions",
    { p_days: days, p_app: app ?? null },
    "rum daily sessions",
  );
  return rows.map((row) => ({
    day: String(row.day ?? ""),
    sessions: Number(row.session_count ?? 0),
    pageviews: Number(row.pageviews ?? 0),
  }));
}
