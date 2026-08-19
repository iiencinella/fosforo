import type { APIRoute } from "astro";
import { getRepositoryHealth } from "@/lib/server/repository";
import { log } from "@/lib/log";

export const prerender = false;

export const GET: APIRoute = async () => {
  const health = await getRepositoryHealth();

  log.info("Health check OK");

  return new Response(
    JSON.stringify({
      ok: true,
      service: "cancionero",
      version: "0.0.1",
      source: health.source,
      totalCanciones: health.totalCanciones,
      totalPublicadas: health.totalPublicadas,
      totalPendientes: health.totalPendientes,
      totalTiempos: health.totalTiempos,
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
};
