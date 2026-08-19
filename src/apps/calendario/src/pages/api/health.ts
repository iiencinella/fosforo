import type { APIRoute } from "astro";

import { getCalendarHealth } from "@/lib/calendar";

export const GET: APIRoute = async () => {
  try {
    const health = await getCalendarHealth();
    return Response.json(health);
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo resolver la salud del calendario.",
      },
      { status: 500 },
    );
  }
};
