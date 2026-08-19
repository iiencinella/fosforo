import type { APIRoute } from "astro";
import { z } from "zod";
import { jsonError, parseJsonBody } from "@repo/api-utils";
import { buildSessionCookies, getSupabaseAuthClient } from "@repo/auth";
import { log } from "@/lib/log";

const loginBodySchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z.string().min(8, "Credenciales invalidas").max(72),
});

export const POST: APIRoute = async ({ request }) => {
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

    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.session || !data.user) {
      log.warn("Login failed: invalid credentials", {
        email: parsed.data.email,
      });
      return jsonError("CANCIONERO_INVALID_CREDENTIALS", 401);
    }

    const headers = new Headers({ "content-type": "application/json" });
    for (const cookie of buildSessionCookies(
      data.session.expires_in,
      data.session.access_token,
      data.session.refresh_token,
    )) {
      headers.append("set-cookie", cookie);
    }

    log.info("Login successful", {
      email: data.user.email ?? parsed.data.email,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          userId: data.user.id,
          email: data.user.email ?? parsed.data.email,
          expiresIn: data.session.expires_in,
        },
      }),
      { status: 200, headers },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "CANCIONERO_INVALID_CREDENTIALS";
    return jsonError(message, 401);
  }
};

export const prerender = false;
