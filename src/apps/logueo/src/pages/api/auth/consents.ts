import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { z } from "zod";
import { getSessionFromRequest } from "@repo/auth";
import { listConsents, updateConsent } from "@/lib/consents";

/**
 * GET /api/auth/consents — lista de consentimientos del usuario
 * (FR-AUTH-004). PUT actualiza una categoria; la RLS garantiza que solo
 * se toquen las filas del usuario.
 */
export const GET: APIRoute = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError("LOGUEO_SESSION_EXPIRED", 401);
  }

  try {
    const consents = await listConsents(session.token);
    return jsonOk({ consents });
  } catch {
    return jsonError("LOGUEO_CONSENTS_READ_FAILED", 500);
  }
};

const putSchema = z.object({
  category: z.enum(["product", "liturgical", "community"]),
  optedIn: z.boolean(),
});

/**
 * POST /api/auth/consents — version form-data para el panel de la propia
 * app (checkboxes consent_{categoria}). Actualiza todas las categorias
 * recibidas y vuelve a /.
 */
export const POST: APIRoute = async ({ request }) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return new Response(null, {
      status: 303,
      headers: { location: "/login" },
    });
  }

  try {
    const formData = await request.formData();
    for (const category of ["product", "liturgical", "community"] as const) {
      const value = formData.get(`consent_${category}`);
      if (value === null) {
        continue;
      }
      await updateConsent(session.token, category, value === "on");
    }
    return new Response(null, {
      status: 303,
      headers: { location: "/?notice=consents_saved" },
    });
  } catch {
    return new Response(null, {
      status: 303,
      headers: { location: "/?error=consents_failed" },
    });
  }
};

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
    const consent = await updateConsent(
      session.token,
      parsed.data.category,
      parsed.data.optedIn,
    );
    return jsonOk({ consent }, 200);
  } catch {
    return jsonError("LOGUEO_CONSENTS_WRITE_FAILED", 500);
  }
};

export const prerender = false;
