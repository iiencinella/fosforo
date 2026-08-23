import type { APIRoute } from "astro";

import {
  CalendarMonthInputError,
  CalendarInputError,
  getMonthCalendar,
  parseDateParam,
  parseMonthParams,
} from "@/lib/calendar";

import { log } from "@/lib/log";

export const GET: APIRoute = async ({ url }) => {
  try {
    const selectedDate = parseDateParam(url.searchParams.get("date"));
    const monthDate = parseMonthParams(
      url.searchParams.get("year"),
      url.searchParams.get("month"),
      selectedDate,
    );
    const month = await getMonthCalendar(monthDate, selectedDate);

    return Response.json(month, { headers: CACHE_HEADERS });
  } catch (error) {
    if (error instanceof CalendarMonthInputError) {
      return Response.json(
        {
          code: "CALENDAR_INVALID_MONTH",
          message: error.message,
        },
        { status: 400, headers: CACHE_HEADERS },
      );
    }

    await log.error("Fallo resolviendo vista mensual", {
      date: url.searchParams.get("date"),
      year: url.searchParams.get("year"),
      month: url.searchParams.get("month"),
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        code: "CALENDAR_MONTH_ERROR",
        message: "No se pudo resolver la vista mensual solicitada.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};
