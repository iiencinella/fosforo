import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { getSearchDataSource } from "@/lib/repository";
import { parseSearchParams, searchCelebrationsFromSource } from "@/lib/search";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = parseSearchParams(url.searchParams);
    const source = await getSearchDataSource();
    const result = searchCelebrationsFromSource(source, params);

    return new Response(
      JSON.stringify({
        ok: true,
        ...result,
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
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          code: "HORARIOS_INVALID_QUERY",
          message:
            error.issues[0]?.message ??
            "Parametros invalidos para la consulta.",
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        },
      );
    }

    await log.error("Fallo en busqueda de celebraciones", {
      error: error instanceof Error ? error.message : String(error),
      query: url.searchParams.toString(),
    });

    return new Response(
      JSON.stringify({
        code: "HORARIOS_SEARCH_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos resolver la busqueda en este momento.",
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      },
    );
  }
};

export const prerender = false;
