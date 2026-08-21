import type { APIRoute } from "astro";
import { getAccessTokenFromRequest } from "@/lib/auth";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { clearSessionCookies } from "@/lib/session";

export const POST: APIRoute = async ({ request }) => {
  const token = getAccessTokenFromRequest(request);

  if (token) {
    try {
      await getSupabaseServiceClient().auth.admin.signOut(token);
    } catch (error) {
      console.warn(`[log] logout revocation failed: ${String(error)}`);
    }
  }

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
