import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "log",
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
};

export const prerender = false;
