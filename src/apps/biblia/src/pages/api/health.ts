import type { APIRoute } from "astro";
import { getBibleVersionCatalog } from "@/lib/server/bible-versions";
import { log } from "@/lib/log";

export const GET: APIRoute = async () => {
  const startedAt = Date.now();
  const catalog = await getBibleVersionCatalog();

  const durationMs = Date.now() - startedAt;

  if (catalog.errorMessage) {
    log.error("Health check failed", { error: catalog.errorMessage });
  } else {
    log.info("Health check OK");
  }

  return new Response(
    JSON.stringify({
      success: !catalog.errorMessage,
      status: catalog.errorMessage ? "degraded" : "ok",
      service: "biblia",
      durationMs,
      versionsCount: catalog.versions.length,
      defaultVersion: catalog.defaultVersionCode,
      timestamp: new Date().toISOString(),
      error: catalog.errorMessage,
    }),
    {
      status: catalog.errorMessage ? 503 : 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
};
