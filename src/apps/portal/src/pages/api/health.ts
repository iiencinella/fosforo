import type { APIRoute } from "astro";
import { log } from "@/lib/log";
import { checkPortalSupabase } from "@/lib/submissions";

export const GET: APIRoute = async () => {
  try {
    const supabaseConfigured = await checkPortalSupabase();

    if (!supabaseConfigured) {
      return new Response(
        JSON.stringify({
          success: false,
          status: "degraded",
          service: "portal",
          dependencies: { supabase: "unavailable" },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    log.info("Health check OK");
    return new Response(
      JSON.stringify({
        success: true,
        status: "ok",
        service: "portal",
        version: "0.0.1",
        dependencies: { supabase: "ok" },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    log.error("Health check failed", { error });
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        service: "portal",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
};

export const prerender = false;
