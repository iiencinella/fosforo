import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { requireAdmin } from "@/lib/auth";
import { moderateSong } from "@/lib/server/repository";
import { moderationSchema } from "@/lib/validators";
import { log } from "@/lib/log";

export const prerender = false;

export const PUT: APIRoute = async ({ request, params }) => {
  let session;
  try {
    session = await requireAdmin(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CANCIONERO_SESSION_EXPIRED";
    const status =
      message === "CANCIONERO_NOT_AUTHORIZED_TO_MODERATE" ? 403 : 401;
    return jsonError(message, status);
  }

  const id = params.id;

  try {
    if (!id) {
      return jsonError("Debe indicar el id de la canción", 400);
    }

    const body = await parseJsonBody<unknown>(request);
    if (!body) {
      return jsonError("El cuerpo de la solicitud es inválido", 400);
    }

    const parsed = moderationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Payload inválido",
        400,
      );
    }

    const payload = await moderateSong(id, parsed.data, session.user.id);
    return jsonOk({ source: payload.source, id, accion: parsed.data.accion });
  } catch (error) {
    log.error("Moderacion action failed", { id, error });
    throw error;
  }
};
