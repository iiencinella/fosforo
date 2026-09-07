import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { getSessionFromRequest } from "@repo/auth";

/**
 * GET /api/auth/session — valida el JWT de la cookie y devuelve la sesion
 * minima para otras apps del ecosistema (FR-AUTH-007, IR-AUTH).
 */
export const GET: APIRoute = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError("LOGUEO_SESSION_EXPIRED", 401);
  }

  return jsonOk({
    userId: session.user.id,
    email: session.profile.email,
    name: session.profile.name,
    role: session.profile.roleSlug,
  });
};

export const prerender = false;
