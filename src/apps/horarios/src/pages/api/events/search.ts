import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { trackSearchEvent } from "@/lib/repository";
import { searchEventSchema } from "@/lib/search";

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const parsed = searchEventSchema.parse(payload);
    await trackSearchEvent(parsed);

    return new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        status: 202,
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
          code: "HORARIOS_INVALID_EVENT",
          message: error.issues[0]?.message ?? "Payload de evento invalido.",
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

    return new Response(
      JSON.stringify({
        code: "HORARIOS_EVENT_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos registrar el evento.",
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
