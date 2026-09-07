import type { APIRoute } from "astro";
import { clearSessionCookies, getAccessTokenFromRequest } from "@repo/auth";
import {
  getSessionFromToken,
  revokeSession,
  type LogoutScope,
} from "@/lib/auth-supabase";
import { getClientIp, recordAuditEvent } from "@/lib/audit";

const redirectToError = (code: string) =>
  new Response(null, {
    status: 303,
    headers: { location: `/?error=${code}` },
  });

/**
 * POST /api/auth/logout — revoca la sesion y limpia las cookies
 * (FR-AUTH-006). scope=global revoca todas las sesiones del usuario
 * ("cerrar sesion en todos los dispositivos").
 */
export const POST: APIRoute = async ({ request }) => {
  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return new Response(null, {
      status: 303,
      headers: { location: "/login" },
    });
  }

  try {
    const formData = await request.formData();
    const rawScope = formData.get("scope");
    const scope: LogoutScope = rawScope === "global" ? "global" : "local";

    await revokeSession(token, scope);

    let userId: string | null = null;
    try {
      const session = await getSessionFromToken(token);
      userId = session.user.id;
    } catch {
      // token ya revocado: la auditoria usa el id si esta disponible
    }

    if (userId) {
      await recordAuditEvent({
        userId,
        action: "logout",
        metadata: { app: "logueo", scope },
        ipAddress: getClientIp(request),
      });
    }

    const headers = new Headers({ location: "/login" });
    for (const cookie of clearSessionCookies()) {
      headers.append("set-cookie", cookie);
    }

    return new Response(null, { status: 303, headers });
  } catch {
    return redirectToError("logout_failed");
  }
};

export const prerender = false;
