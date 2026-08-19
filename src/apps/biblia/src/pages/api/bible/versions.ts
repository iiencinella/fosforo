import type { APIRoute } from "astro";
import { getBibleVersionCatalog } from "@/lib/server/bible-versions";
import { log } from "@/lib/log";

export const GET: APIRoute = async () => {
  const catalog = await getBibleVersionCatalog();

  if (catalog.errorMessage) {
    log.error("Version catalog failed", { error: catalog.errorMessage });
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_VERSIONS_ERROR",
        message: catalog.errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      defaultVersion: catalog.defaultVersionCode,
      versions: catalog.versions,
      mode: "internal",
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
