import type { APIRoute } from "astro";
import { loginUser } from "@/lib/auth-supabase";
import { buildSessionCookies } from "@/lib/session";

export const POST: APIRoute = async ({ request }) => {
  const redirectToError = (code: string) =>
    new Response(null, {
      status: 303,
      headers: { location: `/login?error=${code}` },
    });

  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return redirectToError("invalid_credentials");
    }

    const session = await loginUser({ email, password });

    if (session.role !== "dev" && session.role !== "ops") {
      return redirectToError("access_denied");
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
    return redirectToError("invalid_credentials");
  }
};

export const prerender = false;
