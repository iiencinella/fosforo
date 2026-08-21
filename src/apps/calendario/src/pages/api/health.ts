import type { APIRoute } from "astro";

import { getCalendarHealth } from "@/lib/calendar";
import { logCalendarError } from "@/lib/observability";

export const GET: APIRoute = async () => {
  try {
    const health = await getCalendarHealth();
    return Response.json(health, {
      status: health.status === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    logCalendarError("calendar_health_failed", error);
    return Response.json(
      {
        status: "error",
        message: "No se pudo resolver la salud del calendario.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};
