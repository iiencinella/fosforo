import type { APIRoute } from "astro";
import { clearSessionCookies } from "@/lib/session";

export const POST: APIRoute = async () => {
  const headers = new Headers({ location: "/login" });
  for (const cookie of clearSessionCookies()) {
    headers.append("set-cookie", cookie);
  }

  return new Response(null, {
    status: 303,
    headers,
  });
};

export const prerender = false;
