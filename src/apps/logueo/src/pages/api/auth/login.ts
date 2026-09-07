import type { APIRoute } from "astro";
import { buildSessionCookies } from "@repo/auth";
import { loginUser } from "@/lib/auth-supabase";
import { getClientIp, recordAuditEvent } from "@/lib/audit";

const redirectToError = (code: string) =>
  new Response(null, {
    status: 303,
    headers: { location: `/login?error=${code}` },
  });

/**
 * POST /api/auth/login — inicia sesion y fija las cookies de sesion del
 * ecosistema (FR-AUTH-001, IR-AUTH). Login valido para cualquier usuario
 * con perfil; el rol de plataforma es informativo.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return redirectToError("invalid_credentials");
    }

    const session = await loginUser({ email, password });

    const headers = new Headers({ location: "/" });
    for (const cookie of buildSessionCookies(
      session.expiresIn,
      session.accessToken,
      session.refreshToken,
    )) {
      headers.append("set-cookie", cookie);
    }

    await recordAuditEvent({
      userId: session.userId,
      action: "login",
      metadata: { app: "logueo" },
      ipAddress: getClientIp(request),
    });

    return new Response(null, { status: 303, headers });
  } catch {
    return redirectToError("invalid_credentials");
  }
};

export const prerender = false;
