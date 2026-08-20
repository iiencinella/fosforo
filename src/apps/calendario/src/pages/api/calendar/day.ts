import type { APIRoute } from "astro";

import {
  CalendarDateInputError,
  CalendarInputError,
  getDayByDate,
  parseDateParam,
} from "@/lib/calendar";
import { logCalendarError } from "@/lib/observability";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const date = parseDateParam(url.searchParams.get("date"));
    const day = await getDayByDate(date);

    if (!day) {
      return Response.json(
        {
          code: "CALENDAR_DAY_NOT_FOUND",
          message: "No hay jornada cargada para la fecha solicitada.",
        },
        { status: 404, headers: CACHE_HEADERS },
      );
    }

    return Response.json(day, { headers: CACHE_HEADERS });
  } catch (error) {
    if (error instanceof CalendarDateInputError) {
      return Response.json(
        {
          code: "CALENDAR_INVALID_DATE",
          message: error.message,
        },
        { status: 400, headers: CACHE_HEADERS },
      );
    }

    if (error instanceof CalendarInputError) {
      return Response.json(
        {
          code: "CALENDAR_INVALID_DATE",
          message: "La fecha solicitada no es válida.",
        },
        { status: 400, headers: CACHE_HEADERS },
      );
    }

    logCalendarError("calendar_day_failed", error);

    return Response.json(
      {
        code: "CALENDAR_DAY_ERROR",
        message: "No se pudo resolver la jornada solicitada.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
};
