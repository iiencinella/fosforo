import type { APIRoute } from "astro";
import { getLiturgyDayRpc, type BibliaLiturgyRow } from "@/db/supabase";
import { formatLiturgyRow } from "@/lib/api-formatters";
import { getLiturgyMeta } from "@/lib/data";
import { log } from "@/lib/log";

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? getTodayIsoDate();
  const rite = (url.searchParams.get("rite") ?? "roman").toLowerCase();
  const regionCode = (url.searchParams.get("region") ?? "AR").toUpperCase();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_LITURGY_INVALID_DATE",
        message: "La fecha debe tener formato YYYY-MM-DD.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (rite !== "roman" || regionCode !== "AR") {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_LITURGY_UNSUPPORTED_SCOPE",
        message: "Actualmente se admite solo rito roman y región AR.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { data, error } = await getLiturgyDayRpc({
    date,
    rite,
    regionCode,
  });

  if (error) {
    log.error("Liturgy daily failed", { date, error });
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_LITURGY_ERROR",
        message: error.message,
        date,
        rite,
        regionCode,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const entry = (data?.[0] as BibliaLiturgyRow | undefined) ?? null;
  if (!entry) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_LITURGY_NOT_FOUND",
        message: "No hay lecturas cargadas para la fecha indicada.",
        date,
        rite,
        regionCode,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  log.info("Liturgy daily resolved", { date });
  return new Response(
    JSON.stringify({
      success: true,
      rite,
      regionCode,
      date,
      source: getLiturgyMeta(),
      reading: formatLiturgyRow(entry),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
};
