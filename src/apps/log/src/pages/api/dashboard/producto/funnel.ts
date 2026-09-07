import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { requireRole } from "@/lib/authz";
import {
  PRODUCT_DASHBOARD_ROLES,
  buildFunnel,
  funnelParamsSchema,
  getFunnelCounts,
} from "@/lib/rum-metrics";

/**
 * GET /api/dashboard/producto/funnel?events=a,b,c[&app=&hours=]
 * Embudo de conversion construido solo con eventos de producto
 * (CA-LOG-RUM-002). Devuelve sesiones unicas por paso con porcentajes.
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    await requireRole(request, [...PRODUCT_DASHBOARD_ROLES]);
  } catch {
    return jsonError("LOG_ACCESS_DENIED", 403);
  }

  const params = funnelParamsSchema.safeParse({
    app: url.searchParams.get("app") ?? undefined,
    hours: url.searchParams.get("hours") ?? undefined,
    events: url.searchParams.get("events") ?? undefined,
  });
  if (!params.success) {
    return jsonError("RUM_INVALID_PARAMS", 422);
  }

  const { events, hours, app } = params.data;
  const counts = await getFunnelCounts(events, hours, app);

  return new Response(
    JSON.stringify({
      ok: true,
      hours,
      app: app ?? null,
      events,
      steps: buildFunnel(events, counts),
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
