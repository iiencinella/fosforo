import type { APIRoute } from "astro";
import { readChapterRpc, type BibliaReadRow } from "@/db/supabase";
import { formatReadRows } from "@/lib/api-formatters";
import { getDefaultVersion, resolveBookSlug } from "@/lib/data";
import { getEnabledBibleVersion } from "@/lib/server/bible-versions";
import { log } from "@/lib/log";

function parseOptionalPositiveInt(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  return parsed;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const bookRaw = url.searchParams.get("book") ?? "";
  const chapterRaw = url.searchParams.get("chapter") ?? "";
  const version = url.searchParams.get("version") ?? getDefaultVersion().code;
  const verseStartRaw = url.searchParams.get("verseStart");
  const verseEndRaw = url.searchParams.get("verseEnd");

  const book = resolveBookSlug(bookRaw);
  const chapterNumber = Number.parseInt(chapterRaw, 10);
  const verseStart = parseOptionalPositiveInt(verseStartRaw);
  const verseEnd = parseOptionalPositiveInt(verseEndRaw);
  const hasVerseStart = verseStartRaw !== null && verseStartRaw.trim() !== "";
  const hasVerseEnd = verseEndRaw !== null && verseEndRaw.trim() !== "";

  if (!book || Number.isNaN(chapterNumber) || chapterNumber <= 0) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_INVALID_REFERENCE",
        message: "Referencia incompleta o inválida.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if ((hasVerseStart && !verseStart) || (hasVerseEnd && !verseEnd)) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_INVALID_REFERENCE",
        message: "El rango de versículos es inválido.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (
    typeof verseStart === "number" &&
    typeof verseEnd === "number" &&
    verseEnd < verseStart
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_INVALID_REFERENCE",
        message: "El rango de versículos es inválido.",
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
        message: "La versión solicitada no está habilitada para lectura.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { data, error } = await readChapterRpc({
    versionCode: enabledVersion.code,
    bookSlug: book,
    chapterNumber,
  });

  if (error) {
    log.error("Read failed", { book, chapter: chapterNumber, error });
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_READ_ERROR",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const filteredRows = ((data ?? []) as BibliaReadRow[]).filter((row) => {
    if (typeof verseStart === "number" && row.verse_number < verseStart) {
      return false;
    }
    if (typeof verseEnd === "number" && row.verse_number > verseEnd) {
      return false;
    }
    return true;
  });

  const verses = formatReadRows(filteredRows);

  if (verses.length === 0) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "BIBLIA_NOT_FOUND",
        message: "No se encontró contenido para la referencia indicada.",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  log.info("Chapter read", { book, chapter: chapterNumber, version });
  return new Response(
    JSON.stringify({
      success: true,
      version: enabledVersion.code,
      book,
      chapter: chapterNumber,
      verseStart,
      verseEnd,
      verses,
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
