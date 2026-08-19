import type { APIRoute } from "astro";

import {
  CalendarInputError,
  getDayByDate,
  parseDateParam,
} from "@/lib/calendar";

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
        { status: 404 },
      );
    }

    return Response.json(day);
  } catch (error) {
    if (error instanceof CalendarInputError) {
      return Response.json(
        {
          code: "CALENDAR_INVALID_DATE",
          message: error.message,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        code: "CALENDAR_DAY_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo resolver la jornada solicitada.",
      },
      { status: 500 },
    );
  }
};
