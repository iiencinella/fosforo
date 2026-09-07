import type { APIRoute } from "astro";
import { buildSessionCookies } from "@repo/auth";
import { registerUser } from "@/lib/auth-supabase";
import { getClientIp, recordAuditEvent } from "@/lib/audit";

const redirectTo = (location: string) =>
  new Response(null, { status: 303, headers: { location } });

/**
 * POST /api/auth/register — crea la cuenta (FR-AUTH-001). Si el proyecto
 * exige confirmacion por email, responde con notice=check_email; si no,
 * fija las cookies de sesion y entra directo.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return redirectTo("/register?error=invalid_input");
    }

    const result = await registerUser({ name, email, password });

    if (result.needsEmailConfirmation || !result.session) {
      return redirectTo("/register?notice=check_email");
    }

    const headers = new Headers({ location: "/" });
    for (const cookie of buildSessionCookies(
      result.session.expiresIn,
      result.session.accessToken,
      result.session.refreshToken,
    )) {
      headers.append("set-cookie", cookie);
    }

    await recordAuditEvent({
      userId: result.session.userId,
      action: "register",
      metadata: { app: "logueo" },
      ipAddress: getClientIp(request),
    });

    return new Response(null, { status: 303, headers });
  } catch {
    return redirectTo("/register?error=register_failed");
  }
};

export const prerender = false;
