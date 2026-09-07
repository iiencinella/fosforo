import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { z } from "zod";
import { getSessionFromRequest } from "@repo/auth";
import { listConsents, updateProfile } from "@/lib/consents";

/**
 * GET /api/auth/me — perfil completo del usuario autenticado
 * (FR-AUTH-003/007). PUT actualiza nombre y avatar (RLS por dueno,
 * grant update(name, avatar_url) de harden_users_rbac).
 */
export const GET: APIRoute = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError("LOGUEO_SESSION_EXPIRED", 401);
  }

  try {
    const consents = await listConsents(session.token);
    return jsonOk({
      profile: {
        id: session.profile.id,
        email: session.profile.email,
        name: session.profile.name,
        avatarUrl: session.profile.avatarUrl,
        role: session.profile.roleSlug,
      },
      consents,
    });
  } catch {
    return jsonError("LOGUEO_PROFILE_NOT_FOUND", 500);
  }
};

const putSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    avatarUrl: z.url().max(500).optional(),
  })
  .refine(
    (input) => input.name !== undefined || input.avatarUrl !== undefined,
    { message: "Nada que actualizar" },
  );

export const PUT: APIRoute = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError("LOGUEO_SESSION_EXPIRED", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("LOGUEO_INVALID_INPUT", 422);
  }

  try {
    const profile = await updateProfile(session.token, session.user.id, {
      name: parsed.data.name,
      avatarUrl: parsed.data.avatarUrl,
    });
    return jsonOk({
      profile: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        role: profile.roleSlug,
      },
    });
  } catch {
    return jsonError("LOGUEO_PROFILE_UPDATE_FAILED", 500);
  }
};

export const prerender = false;
