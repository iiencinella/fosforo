import type { APIRoute } from "astro";
import { getSearchDataSource } from "@/lib/repository";
import { getTempleDetailFromSource } from "@/lib/search";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ params }) => {
  const templeId = params.id;
  if (!templeId) {
    return new Response(
      JSON.stringify({
        code: "HORARIOS_MISSING_TEMPLE_ID",
        message: "Debes indicar el identificador del templo.",
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

  try {
    const source = await getSearchDataSource();
    const detail = getTempleDetailFromSource(source, templeId);
    if (!detail) {
      return new Response(
        JSON.stringify({
          code: "HORARIOS_TEMPLE_NOT_FOUND",
          message: "No encontramos el templo solicitado.",
        }),
        {
          status: 404,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        ...detail,
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
    await log.error("Fallo obteniendo detalle de templo", {
      error: error instanceof Error ? error.message : String(error),
      templeId,
    });

    return new Response(
      JSON.stringify({
        code: "HORARIOS_TEMPLE_ERROR",
        message: "No pudimos resolver el templo en este momento.",
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
