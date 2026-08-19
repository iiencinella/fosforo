import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { getSongById } from "@/lib/server/repository";
import { log } from "@/lib/log";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return jsonError("Debe indicar el id de la canción", 400);
  }

  try {
    const song = await getSongById(id);
    if (!song) {
      return jsonError("Canción no encontrada", 404);
    }

    return jsonOk({ item: song });
  } catch (error) {
    log.error("Failed to fetch song", { id, error });
    throw error;
  }
};
