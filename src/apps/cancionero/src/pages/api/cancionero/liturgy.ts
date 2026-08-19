import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { listSongs } from "@/lib/server/repository";
import { getCurrentLiturgicalTimeId } from "@/lib/server/calendar";
import { log } from "@/lib/log";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const tiempo = url.searchParams.get("tiempo") ?? undefined;
  const momento = url.searchParams.get("momento") ?? undefined;

  try {
    const resolvedTime =
      tiempo ?? (await getCurrentLiturgicalTimeId()) ?? undefined;
    if (!resolvedTime && !momento) {
      return jsonError(
        "Debe indicar al menos un tiempo litúrgico o momento de misa",
        400,
      );
    }

    const payload = await listSongs({
      tiempo: resolvedTime,
      momento,
    });

    return jsonOk({
      ...payload,
      tiempoAplicado: resolvedTime ?? null,
    });
  } catch (error) {
    log.error("Failed to fetch liturgy data", { error });
    throw error;
  }
};
