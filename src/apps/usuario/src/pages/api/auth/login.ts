import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@repo/api-utils";
import { log } from "@/lib/log";
import { loginUser } from "@/lib/auth";
import { buildSessionCookies } from "@/lib/session";
import { consumeAuthRateLimit, getClientIp } from "@/lib/rate-limit";

const loginBodySchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z.string().min(8, "Credenciales invalidas").max(72),
});

export const POST: APIRoute = async ({ request }) => {
  if (!consumeAuthRateLimit("login", getClientIp(request))) {
    return jsonError("USERS_RATE_LIMITED", 429);
  }

  let email: string | undefined;
  try {
    const payload = await parseJsonBody<unknown>(request);
    if (!payload) {
      return jsonError("JSON invalido", 400);
    }

    const parsed = loginBodySchema.safeParse(payload);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "Datos invalidos",
        400,
      );
    }

    email = parsed.data.email;
    const session = await loginUser(parsed.data);
    const headers = new Headers({ "content-type": "application/json" });

    for (const cookie of buildSessionCookies(
      session.expiresIn,
      session.accessToken,
      session.refreshToken,
    )) {
      headers.append("set-cookie", cookie);
    }

    log.info("Login successful", { email });
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          userId: session.userId,
          email: session.email,
          expiresIn: session.expiresIn,
        },
      }),
      { status: 200, headers },
    );
  } catch (error) {
    log.warn("Login failed: invalid credentials", { email });
    return jsonError("USERS_INVALID_CREDENTIALS", 401);
  }
};

export const prerender = false;
