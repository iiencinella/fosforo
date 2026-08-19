import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { createLogRepository } from "@/lib/log-repository";
import { requireRole } from "@/lib/authz";

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireRole(request, ["ops"]);
  } catch {
    return jsonError("LOG_ACCESS_DENIED", 403);
  }

  const repository = createLogRepository();
  const { metrics, hourlySeries, alerts } = await repository.metrics();

  return new Response(
    JSON.stringify({
      ok: true,
      metrics,
      hourlySeries,
      alerts,
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
