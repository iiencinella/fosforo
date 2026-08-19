import type { APIRoute } from "astro";
import { getSearchDataSource } from "@/lib/repository";
import { getTempleDetailFromSource } from "@/lib/search";

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
};

export const prerender = false;
