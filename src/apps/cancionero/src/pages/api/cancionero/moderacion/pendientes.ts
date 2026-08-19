import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { requireAdmin } from "@/lib/auth";
import { listPendingSongs } from "@/lib/server/repository";
import { log } from "@/lib/log";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CANCIONERO_SESSION_EXPIRED";
    const status =
      message === "CANCIONERO_NOT_AUTHORIZED_TO_MODERATE" ? 403 : 401;
    return jsonError(message, status);
  }

  try {
    const payload = await listPendingSongs();
    return jsonOk(payload);
  } catch (error) {
    log.error("Failed to fetch pendientes", { error });
    throw error;
  }
};
