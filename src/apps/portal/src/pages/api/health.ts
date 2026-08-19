import type { APIRoute } from "astro";
import { log } from "@/lib/log";

export const GET: APIRoute = () => {
  try {
    log.info("Health check OK");
    return new Response(
      JSON.stringify({
        success: true,
        status: "ok",
        service: "portal",
        version: "0.0.1",
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
