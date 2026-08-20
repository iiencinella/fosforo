import type { APIRoute } from "astro";

import {
  CalendarMonthInputError,
  CalendarInputError,
  getMonthCalendar,
  parseDateParam,
  parseMonthParams,
} from "@/lib/calendar";
import { logCalendarError } from "@/lib/observability";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

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

    if (error instanceof CalendarInputError) {
      return Response.json(
        {
          code: "CALENDAR_INVALID_DATE",
          message: "La fecha seleccionada no es válida.",
        },
        { status: 400, headers: CACHE_HEADERS },
      );
    }

    logCalendarError("calendar_month_failed", error);

    return Response.json(
      {
        code: "CALENDAR_MONTH_ERROR",
        message: "No se pudo resolver la vista mensual solicitada.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};
