import type { APIRoute } from "astro";
import { getRepositoryHealth } from "@/lib/repository";

export const GET: APIRoute = async () => {
  const health = await getRepositoryHealth();

  return new Response(
    JSON.stringify({
      ok: true,
      service: "horarios",
      version: "0.0.1",
      source: health.source,
      templeCount: health.templeCount,
      celebrationCount: health.celebrationCount,
      searchEventCount: health.searchEventCount,
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

export const prerender = false;
