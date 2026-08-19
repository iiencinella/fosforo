import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getCategoryLabel, sortAppsCatalogEntries } from "@/lib/apps-catalog";
import { log } from "@/lib/log";

export const GET: APIRoute = async () => {
  try {
    const apps = sortAppsCatalogEntries(
      (await getCollection("appsCatalog")).filter(
        (app) => app.data.visible !== false,
      ),
    ).map((app) => ({
      slug: app.data.slug,
      name: app.data.name,
      resume: app.data.resume,
      category: getCategoryLabel(app.data.category),
      status: app.data.status,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        apps,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    log.error("Failed to fetch apps catalog", { error });
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error al obtener el catálogo de aplicaciones",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
};

export const prerender = false;
