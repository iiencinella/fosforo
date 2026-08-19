import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { listSongs } from "@/lib/server/repository";
import { searchQuerySchema } from "@/lib/validators";
import { log } from "@/lib/log";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const motorParam = url.searchParams.get("motor");
  const parsed = searchQuerySchema.safeParse({
    motor:
      motorParam === "A" || motorParam === "B" || motorParam === "C"
        ? motorParam
        : undefined,
    q: url.searchParams.get("q") ?? undefined,
    tiempo: url.searchParams.get("tiempo") ?? undefined,
    momento: url.searchParams.get("momento") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Parámetros inválidos",
      400,
    );
  }

  try {
    const payload = await listSongs(parsed.data);
    return jsonOk(payload);
  } catch (error) {
    log.error("Search failed", { query: parsed.data.q, error });
    return jsonError("No se pudo ejecutar la búsqueda", 500);
  }
};
