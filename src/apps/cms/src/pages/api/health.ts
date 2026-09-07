import type { APIRoute } from "astro";
import { jsonOk } from "@repo/api-utils";

/**
 * GET /api/health — healthcheck del servicio (IR-CMS-005, patron de log).
 */
export const GET: APIRoute = async () => {
  return jsonOk({
    service: "cms",
    version: "0.0.0",
    timestamp: new Date().toISOString(),
  });
};

export const prerender = false;
