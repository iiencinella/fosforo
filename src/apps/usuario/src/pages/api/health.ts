import type { APIRoute } from "astro";
import { log } from "@/lib/log";

export const GET: APIRoute = async () => {
  try {
    log.info("Health check OK");
    return new Response(
      JSON.stringify({
        ok: true,
        service: "usuarios",
        version: "0.0.1",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    log.error("Health check failed", { error });
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};

export const prerender = false;
