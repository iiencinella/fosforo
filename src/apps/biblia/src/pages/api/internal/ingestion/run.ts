import { getBibliaEnv } from "@repo/env";
import type { APIRoute } from "astro";
import { log } from "@/lib/log";

const INTERNAL_INGESTION_KEY = getBibliaEnv()?.ingestionKey ?? "";

function unauthorizedResponse(message: string, status = 401) {
  return new Response(
    JSON.stringify({
      success: false,
      code: "BIBLIA_INGESTION_UNAUTHORIZED",
      message,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export const POST: APIRoute = async ({ request }) => {
  if (!INTERNAL_INGESTION_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_INGESTION_KEY_NOT_CONFIGURED",
        message:
          "Falta configurar BIBLIA_INTERNAL_INGESTION_KEY en el entorno del servidor.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const authHeader = request.headers.get("authorization");
  const providedKey = request.headers.get("x-biblia-ingestion-key");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;
  const candidate = providedKey ?? bearerToken;

  if (!candidate) {
    log.warn("Ingestion unauthorized attempt", {
      error: "No credential provided",
    });
    return unauthorizedResponse(
      "Falta credencial interna. Envía x-biblia-ingestion-key o Authorization Bearer.",
    );
  }

  if (candidate !== INTERNAL_INGESTION_KEY) {
    log.warn("Ingestion unauthorized attempt", { error: "Invalid credential" });
    return unauthorizedResponse("La credencial interna no es válida.", 403);
  }

  log.info("Ingestion run completed", { status: "manual_only" });
  return new Response(
    JSON.stringify({
      success: false,
      code: "BIBLIA_INGESTION_MANUAL_ONLY",
      message:
        "La ruta quedó protegida, pero la ingestión automática todavía no está habilitada en esta reconstrucción inicial.",
    }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    },
  );
};
