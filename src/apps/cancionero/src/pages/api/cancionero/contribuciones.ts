import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { requireContributor } from "@/lib/auth";
import { createContribution } from "@/lib/server/repository";
import { contributionSchema } from "@/lib/validators";
import { log } from "@/lib/log";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let session;
  try {
    session = await requireContributor(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CANCIONERO_SESSION_EXPIRED";
    const status =
      message === "CANCIONERO_NOT_AUTHORIZED_TO_CONTRIBUTE" ? 403 : 401;
    return jsonError(message, status);
  }

  try {
    const body = await parseJsonBody<unknown>(request);
    if (!body) {
      return jsonError("El cuerpo de la solicitud es inválido", 400);
    }

    const parsed = contributionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Payload inválido",
        400,
      );
    }

    const payload = await createContribution(
      {
        ...parsed.data,
        pdfUrl: parsed.data.pdfUrl || undefined,
        youtubeUrl: parsed.data.youtubeUrl || undefined,
      },
      session.user.id,
    );

    return jsonOk(
      {
        id: payload.id,
        source: payload.source,
        message: "Tu canción fue enviada para moderación",
      },
      201,
    );
  } catch (error) {
    log.error("Contribucion operation failed", { error });
    throw error;
  }
};
