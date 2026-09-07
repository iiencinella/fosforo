import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { requireRole } from "@/lib/authz";
import {
  PRODUCT_DASHBOARD_ROLES,
  getDailySessions,
  getEventsByApp,
  getTopPages,
  getVitalsDistribution,
  buildVitalsSummary,
  topPagesParamsSchema,
} from "@/lib/rum-metrics";

/**
 * GET /api/dashboard/producto — resumen de producto RUM (FR-LOG-RUM-005):
 * top paginas, distribucion de Web Vitals, actividad diaria y eventos por
 * app. Acceso: roles dev/ops/product (RB-LOG-RUM-004).
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    await requireRole(request, [...PRODUCT_DASHBOARD_ROLES]);
  } catch {
    return jsonError("LOG_ACCESS_DENIED", 403);
  }

  const params = topPagesParamsSchema.safeParse({
    app: url.searchParams.get("app") ?? undefined,
    hours: url.searchParams.get("hours") ?? undefined,
  });
  if (!params.success) {
    return jsonError("RUM_INVALID_PARAMS", 422);
  }

  const hours = params.data.hours;
  const app = params.data.app;

  const [topPages, vitals, dailySessions, eventsByApp] = await Promise.all([
    getTopPages(hours, app),
    getVitalsDistribution(hours, app),
    getDailySessions(30, app),
    getEventsByApp(hours),
  ]);

  return new Response(
    JSON.stringify({
      ok: true,
      hours,
      app: app ?? null,
      summary: {
        vitals: buildVitalsSummary(vitals),
        dailySessionCount: dailySessions.length,
      },
      topPages,
      vitals,
      dailySessions,
      eventsByApp,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    },
  );
};

export const prerender = false;
