import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { requireRole } from "@/lib/authz";
import {
  PRODUCT_DASHBOARD_ROLES,
  getDailySessions,
  retentionParamsSchema,
} from "@/lib/rum-metrics";

/**
 * GET /api/dashboard/producto/retention?days=30[&app=]
 * Actividad diaria como proxy de retencion. Por decision de privacidad
 * (ADR-LOG-RUM-004) el session_id_anon no persiste entre sesiones, por lo
 * que la retencion de usuarios individuales no es medible; el proxy es la
 * serie de sesiones y paginas vistas por dia.
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    await requireRole(request, [...PRODUCT_DASHBOARD_ROLES]);
  } catch {
    return jsonError("LOG_ACCESS_DENIED", 403);
  }

  const params = retentionParamsSchema.safeParse({
    app: url.searchParams.get("app") ?? undefined,
    days: url.searchParams.get("days") ?? undefined,
  });
  if (!params.success) {
    return jsonError("RUM_INVALID_PARAMS", 422);
  }

  const { days, app } = params.data;
  const dailySessions = await getDailySessions(days, app);

  return new Response(
    JSON.stringify({
      ok: true,
      days,
      app: app ?? null,
      dailySessions,
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
