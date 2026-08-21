import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { log } from "@/lib/log";
import { requireSession } from "@/lib/authz";
import { getUserProfileById, updateUserProfile } from "@/lib/profiles";

const updateProfileBodySchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(80).optional(),
  avatarUrl: z
    .string()
    .regex(/^https?:\/\/.+$/u, "Avatar invalido")
    .nullable()
    .optional(),
});

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await requireSession(request);
    const profile = await getUserProfileById(session.user.id, session.token);
    return jsonOk({ data: profile });
  } catch (error) {
    log.error("Profile operation failed", { error });
    const message = error instanceof Error ? error.message : "";
    const status = message === "USERS_SESSION_EXPIRED" ? 401 : 404;
    return jsonError(
      message === "USERS_SESSION_EXPIRED" ? message : "USERS_PROFILE_NOT_FOUND",
      status,
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const session = await requireSession(request);
    const payload = await parseJsonBody<unknown>(request);
    if (!payload) {
      return jsonError("JSON invalido", 400);
    }

    const parsed = updateProfileBodySchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Datos invalidos",
        400,
      );
    }

    const profile = await updateUserProfile(
      session.user.id,
      session.token,
      parsed.data,
    );
    return jsonOk({ data: profile });
  } catch (error) {
    log.error("Profile operation failed", { error });
    const message = error instanceof Error ? error.message : "";

    if (message === "USERS_SESSION_EXPIRED") {
      return jsonError(message, 401);
    }

    return jsonError("USERS_PROFILE_UPDATE_FAILED", 400);
  }
};

export const prerender = false;
