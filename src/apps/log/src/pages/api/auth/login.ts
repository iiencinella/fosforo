import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { loginUser } from "@/lib/auth-supabase";
import { buildSessionCookies } from "@/lib/session";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return jsonError("Credenciales invalidas", 400);
    }

    const session = await loginUser({ email, password });

    if (session.role !== "dev" && session.role !== "ops") {
      return jsonError("LOG_ACCESS_DENIED", 403);
    }

    const headers = new Headers({
      location: session.role === "ops" ? "/dashboard" : "/logs",
    });

    for (const cookie of buildSessionCookies(
      session.expiresIn,
      session.accessToken,
      session.refreshToken,
    )) {
      headers.append("set-cookie", cookie);
    }

    return new Response(null, {
      status: 303,
      headers,
    });
  } catch {
    return jsonError("LOG_INVALID_CREDENTIALS", 401);
  }
};

export const prerender = false;
