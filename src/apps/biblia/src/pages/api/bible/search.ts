import type { APIRoute } from "astro";
import {
  readChapterRpc,
  searchVersesRpc,
  type BibliaReadRow,
  type BibliaSearchRow,
} from "@/db/supabase";
import { formatReadRows, formatSearchRows } from "@/lib/api-formatters";
import { getDefaultVersion } from "@/lib/data";
import { parseBibleReferenceQuery } from "@/lib/data";
import { getEnabledBibleVersion } from "@/lib/server/bible-versions";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim() ?? "";
  const version = url.searchParams.get("version") ?? getDefaultVersion().code;

  if (query.length < 2) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_SEARCH_INVALID_QUERY",
        message: "La consulta debe tener al menos 2 caracteres.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { version: enabledVersion, errorMessage } =
    await getEnabledBibleVersion(version);

  if (errorMessage) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_VERSION_LOOKUP_ERROR",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!enabledVersion) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_VERSION_DISABLED",
        message: "La versión solicitada no está habilitada para búsqueda.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const parsedReference = parseBibleReferenceQuery(query);

  if (parsedReference) {
    const chaptersToFetch: number[] = [parsedReference.chapter];
    if (parsedReference.isCrossChapter && parsedReference.chapterEnd) {
      for (
        let ch = parsedReference.chapter + 1;
        ch <= parsedReference.chapterEnd;
        ch++
      ) {
        chaptersToFetch.push(ch);
      }
    }

    const allResults: Array<{
      versionCode: string;
      bookSlug: string;
      bookName: string;
      chapter: number;
      verse: number;
      reference: string;
      text: string;
      rank: number;
    }> = [];

    for (const chapterNumber of chaptersToFetch) {
      const { data, error } = await readChapterRpc({
        versionCode: enabledVersion.code,
        bookSlug: parsedReference.bookSlug,
        chapterNumber,
      });

      if (error) {
        log.error("Search failed", { query, error });
        return new Response(
          JSON.stringify({
            success: false,
            code: "BIBLIA_SEARCH_ERROR",
            message: error.message,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const chapterResults = formatReadRows((data ?? []) as BibliaReadRow[])
        .filter((row) => {
          // If verseRanges is defined, check if verse is in any range
          if (
            parsedReference.verseRanges &&
            parsedReference.verseRanges.length > 0
          ) {
            return parsedReference.verseRanges.some(
              (range) => row.verse >= range.start && row.verse <= range.end,
            );
          }

          // For the first chapter, filter from verseStart
          if (
            chapterNumber === parsedReference.chapter &&
            typeof parsedReference.verseStart === "number" &&
            row.verse < parsedReference.verseStart
          ) {
            return false;
          }
          // For the last chapter, filter up to verseEnd (use chapterEnd for cross-chapter)
          if (
            parsedReference.isCrossChapter &&
            parsedReference.chapterEnd &&
            chapterNumber === parsedReference.chapterEnd
          ) {
            // For cross-chapter, we don't have a verseEnd for the last chapter
            // So we include all verses from the last chapter
            return true;
          }
          // For same-chapter references, filter by verseEnd
          if (
            !parsedReference.isCrossChapter &&
            typeof parsedReference.verseEnd === "number" &&
            row.verse > parsedReference.verseEnd
          ) {
            return false;
          }
          return true;
        })
        .map((row) => ({ ...row, rank: 1 }));

      allResults.push(...chapterResults);
    }

    log.info("Search executed", { query, version });
    return new Response(
      JSON.stringify({
        success: true,
        code: allResults.length === 0 ? "BIBLIA_SEARCH_EMPTY" : undefined,
        message:
          allResults.length === 0
            ? "No se encontraron resultados para la búsqueda."
            : undefined,
        version: enabledVersion.code,
        query,
        normalizedReference: parsedReference.normalized,
        total: allResults.length,
        results: allResults,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const { data, error } = await searchVersesRpc({
    versionCode: enabledVersion.code,
    query,
    limit: 30,
  });

  if (error) {
    log.error("Search failed", { query, error });
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_SEARCH_ERROR",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const results = formatSearchRows((data ?? []) as BibliaSearchRow[]);

  log.info("Search executed", { query, version });
  return new Response(
    JSON.stringify({
      success: true,
      code: results.length === 0 ? "BIBLIA_SEARCH_EMPTY" : undefined,
      message:
        results.length === 0
          ? "No se encontraron resultados para la búsqueda."
          : undefined,
      version: enabledVersion.code,
      query,
      total: results.length,
      results,
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
