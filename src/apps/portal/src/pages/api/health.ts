import type { APIRoute } from "astro";
import { log } from "@/lib/log";
import { checkPortalSupabase } from "@/lib/submissions";

export const GET: APIRoute = async () => {
  let supabaseConfigured = false;
  try {
    supabaseConfigured = await checkPortalSupabase();
  } catch (error) {
    // Faltan variables de entorno o el cliente no puede inicializarse:
    // es un estado degradado operativo, no un error de infraestructura.
    log.warn("Health check con Supabase no disponible", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
  }

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
};

export const prerender = false;
