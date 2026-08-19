import type { APIRoute } from "astro";

import {
  CalendarInputError,
  getMonthCalendar,
  parseDateParam,
  parseMonthParams,
} from "@/lib/calendar";

export const GET: APIRoute = async ({ url }) => {
  try {
    const selectedDate = parseDateParam(url.searchParams.get("date"));
    const monthDate = parseMonthParams(
      url.searchParams.get("year"),
      url.searchParams.get("month"),
      selectedDate,
    );
    const month = await getMonthCalendar(monthDate, selectedDate);

    return Response.json(month);
  } catch (error) {
    if (error instanceof CalendarInputError) {
      return Response.json(
        {
          code: "CALENDAR_INVALID_MONTH",
          message: error.message,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        code: "CALENDAR_MONTH_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo resolver la vista mensual solicitada.",
      },
      { status: 500 },
    );
  }
};
