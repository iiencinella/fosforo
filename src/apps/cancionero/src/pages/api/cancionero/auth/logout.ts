import type { APIRoute } from "astro";
import { clearSessionCookies, getSupabaseAuthClient } from "@repo/auth";
import { log } from "@/lib/log";

export const POST: APIRoute = async () => {
  try {
    const supabase = getSupabaseAuthClient();
    await supabase.auth.signOut();
  } catch {
    // no-op: always clear cookies locally even if remote signout fails
  }

  const headers = new Headers({ "content-type": "application/json" });
  for (const cookie of clearSessionCookies()) {
    headers.append("set-cookie", cookie);
  }

  log.info("User logged out");

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const prerender = false;
