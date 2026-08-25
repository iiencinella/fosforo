import versionesJson from "@/data/versiones.json";
import nomenclatureJson from "@/data/nomenclature.json";
import structureBibleJson from "@/data/La Biblia del Pueblo de Dios/structure_bible.json";
import curatedPassagesJson from "@/data/pasajes-scb.json";
import liturgyJson from "@/data/liturgy_readings.json";
import type {
  BibleBook,
  BibleVersion,
  CuratedPassage,
  LiturgyDataset,
  NomenclatureEntry,
} from "@/lib/types";

const versions = versionesJson as BibleVersion[];
const nomenclature = nomenclatureJson as NomenclatureEntry[];
const bibleStructure = structureBibleJson as BibleBook[];
const curatedPassages = curatedPassagesJson as CuratedPassage[];
const liturgyDataset = liturgyJson as LiturgyDataset;

const bookSlugByName = new Map<string, string>();
const bookSlugByAlias = new Map<string, string>();
const bookNameBySlug = new Map<string, string>();

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeAliasKey(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function toCompactAlias(key: string): string {
  return key.replace(/\s+/g, "");
}

function setAlias(alias: string, slug: string) {
  const normalized = normalizeAliasKey(alias);
  if (!normalized) return;
  bookSlugByAlias.set(normalized, slug);
  bookSlugByAlias.set(toCompactAlias(normalized), slug);
}

for (const entry of nomenclature) {
  const slug = slugify(entry.nombre);
  bookSlugByName.set(entry.nombre.toLowerCase(), slug);
  bookNameBySlug.set(slug, entry.nombre);
  setAlias(entry.nombre, slug);
  for (const abbreviation of entry.abreviatura) {
    setAlias(abbreviation, slug);
  }
}

function normalizeBookName(bookName: string): string {
  const lowered = bookName.trim().toLowerCase();
  const aliasKey = normalizeAliasKey(bookName);
  return (
    bookSlugByAlias.get(aliasKey) ??
    bookSlugByAlias.get(toCompactAlias(aliasKey)) ??
    bookSlugByName.get(lowered) ??
    slugify(bookName)
  );
}

export type VerseRange = {
  start: number;
  end: number;
};

export type ParsedBibleReference = {
  bookSlug: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  normalized: string;
  isCrossChapter?: boolean;
  chapterEnd?: number;
  chapterEndVerse?: number;
  verseRanges?: VerseRange[];
};

export function parseBibleReferenceQuery(
  input: string,
): ParsedBibleReference | null {
  // Normalize double dash to single dash for cross-chapter references
  const normalizedInput = input.trim().replace(/--/g, "-");
  if (!normalizedInput) return null;

  // Try cross-chapter range first: "Book 1:20-2:4"
  const crossChapterMatch = normalizedInput.match(
    /^(.+?)\s+(\d+)\s*[,.:]\s*(\d+)\s*-\s*(\d+)\s*[,.:]\s*(\d+)$/,
  );

  if (crossChapterMatch) {
    const [
      ,
      bookRaw,
      chapterStartRaw,
      verseStartRaw,
      chapterEndRaw,
      verseEndRaw,
    ] = crossChapterMatch;
    const bookSlug = resolveBookSlug(bookRaw);
    if (!bookSlug) return null;

    const chapterStart = Number.parseInt(chapterStartRaw, 10);
    const verseStart = Number.parseInt(verseStartRaw, 10);
    const chapterEnd = Number.parseInt(chapterEndRaw, 10);
    const verseEnd = Number.parseInt(verseEndRaw, 10);

    if (
      Number.isNaN(chapterStart) ||
      chapterStart <= 0 ||
      Number.isNaN(verseStart) ||
      verseStart <= 0 ||
      Number.isNaN(chapterEnd) ||
      chapterEnd <= 0 ||
      Number.isNaN(verseEnd) ||
      verseEnd <= 0
    ) {
      return null;
    }

    // For cross-chapter references, use the start chapter
    // The verse range will be handled by the caller
    const canonicalBookName = getBookBySlug(bookSlug)?.name ?? bookRaw.trim();
    const normalized = `${canonicalBookName} ${chapterStart},${verseStart}-${chapterEnd},${verseEnd}`;

    return {
      bookSlug,
      chapter: chapterStart,
      verseStart,
      verseEnd: verseStart, // Return start verse for compatibility
      normalized,
      isCrossChapter: true,
      chapterEnd,
      chapterEndVerse: verseEnd,
    };
  }

  // Multi-range format: "Book 78:56-59, 61-62" or "Book 78:56-59, 61-62, 65"
  const multiRangeMatch = normalizedInput.match(
    /^(.+?)\s+(\d+)\s*[,.:]\s*(\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)*)+)$/,
  );

  if (multiRangeMatch) {
    const [, bookRaw, chapterRaw, rangesRaw] = multiRangeMatch;
    const bookSlug = resolveBookSlug(bookRaw);
    if (!bookSlug) return null;

    const chapter = Number.parseInt(chapterRaw, 10);
    if (Number.isNaN(chapter) || chapter <= 0) return null;

    // Parse all verse ranges: "56-59, 61-62" -> [{start:56, end:59}, {start:61, end:62}]
    const rangeParts = rangesRaw.split(",").map((s) => s.trim());
    const verseRanges: VerseRange[] = [];

    for (const part of rangeParts) {
      const rangeMatch = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!rangeMatch) return null;

      const start = Number.parseInt(rangeMatch[1], 10);
      const end = rangeMatch[2] ? Number.parseInt(rangeMatch[2], 10) : start;

      if (
        Number.isNaN(start) ||
        start <= 0 ||
        Number.isNaN(end) ||
        end <= 0 ||
        end < start
      ) {
        return null;
      }

      verseRanges.push({ start, end });
    }

    if (verseRanges.length === 0) return null;

    const canonicalBookName = getBookBySlug(bookSlug)?.name ?? bookRaw.trim();
    const rangesStr = verseRanges
      .map((r) => (r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`))
      .join(", ");
    const normalized = `${canonicalBookName} ${chapter},${rangesStr}`;

    return {
      bookSlug,
      chapter,
      verseStart: verseRanges[0].start,
      verseEnd: verseRanges[verseRanges.length - 1].end,
      normalized,
      verseRanges,
    };
  }

  // Standard format: "Book 1:20-25" or "Book 1:20" or "Book 1"
  const match = normalizedInput.match(
    /^(.+?)\s+(\d+)(?:\s*[,.:]\s*(\d+)(?:\s*-\s*(\d+))?)?$/,
  );

  if (!match) return null;

  const [, bookRaw, chapterRaw, verseStartRaw, verseEndRaw] = match;
  const bookSlug = resolveBookSlug(bookRaw);
  if (!bookSlug) return null;

  const chapter = Number.parseInt(chapterRaw, 10);
  if (Number.isNaN(chapter) || chapter <= 0) return null;

  const verseStart = verseStartRaw
    ? Number.parseInt(verseStartRaw, 10)
    : undefined;
  if (verseStartRaw && (!verseStart || verseStart <= 0)) return null;

  const verseEnd = verseEndRaw ? Number.parseInt(verseEndRaw, 10) : verseStart;
  if (verseEndRaw && (!verseEnd || verseEnd <= 0)) return null;

  if (
    typeof verseStart === "number" &&
    typeof verseEnd === "number" &&
    verseEnd < verseStart
  ) {
    return null;
  }

  const canonicalBookName = getBookBySlug(bookSlug)?.name ?? bookRaw.trim();
  const normalized =
    typeof verseStart === "number"
      ? `${canonicalBookName} ${chapter},${verseStart}${verseEnd && verseEnd !== verseStart ? `-${verseEnd}` : ""}`
      : `${canonicalBookName} ${chapter}`;

  return {
    bookSlug,
    chapter,
    verseStart,
    verseEnd,
    normalized,
  };
}

export function filterVersesByReference<
  T extends { chapter: number; verse: number },
>(rows: T[], parsed: ParsedBibleReference): T[] {
  const endChapter = parsed.isCrossChapter
    ? (parsed.chapterEnd ?? parsed.chapter)
    : parsed.chapter;

  return rows
    .filter((row) => row.chapter >= parsed.chapter && row.chapter <= endChapter)
    .filter((row) => {
      if (row.chapter === parsed.chapter) {
        if (parsed.verseRanges?.length) {
          return parsed.verseRanges.some(
            (range) => row.verse >= range.start && row.verse <= range.end,
          );
        }
        if (typeof parsed.verseStart === "number") {
          if (parsed.isCrossChapter) {
            return row.verse >= parsed.verseStart;
          }
          const rangeEnd = parsed.verseEnd ?? parsed.verseStart;
          return row.verse >= parsed.verseStart && row.verse <= rangeEnd;
        }
        return true;
      }
      if (parsed.isCrossChapter && row.chapter === endChapter) {
        return typeof parsed.chapterEndVerse === "number"
          ? row.verse <= parsed.chapterEndVerse
          : true;
      }
      return false;
    });
}

export function buildSearchDeepLink(
  citation: string,
  versionCode: string,
): string {
  const params = new URLSearchParams({
    modo: "busqueda",
    q: citation.trim(),
    version: versionCode,
  });
  return `/?${params.toString()}`;
}

type VerseIndex = {
  versionCode: string;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  searchText: string;
};

const verseIndex: VerseIndex[] = [];
const chapterLookup = new Map<string, VerseIndex[]>();

for (const book of bibleStructure) {
  const bookSlug = normalizeBookName(book.libro);
  const canonicalBookName = bookNameBySlug.get(bookSlug) ?? book.libro;

  for (const chapter of book.capitulos) {
    const chapterKey = `${bookSlug}:${chapter.numero}`;
    const chapterVerses: VerseIndex[] = [];

    for (const verse of chapter.versiculos) {
      const reference = `${canonicalBookName} ${chapter.numero},${verse.numero}`;
      const indexed: VerseIndex = {
        versionCode: getDefaultVersion().code,
        bookSlug,
        bookName: canonicalBookName,
        chapter: chapter.numero,
        verse: verse.numero,
        text: verse.texto,
        reference,
        searchText:
          `${canonicalBookName} ${reference} ${verse.texto}`.toLowerCase(),
      };

      verseIndex.push(indexed);
      chapterVerses.push(indexed);
    }

    chapterLookup.set(chapterKey, chapterVerses);
  }
}

export function getVersions(): BibleVersion[] {
  return versions;
}

export function getDefaultVersion(): BibleVersion {
  return versions.find((version) => version.default) ?? versions[0];
}

export function getBooks() {
  return bibleStructure.map((book) => {
    const slug = normalizeBookName(book.libro);
    const canonicalName = bookNameBySlug.get(slug) ?? book.libro;
    return {
      slug,
      name: canonicalName,
      chapters: book.capitulos.length,
    };
  });
}

export function getBookBySlug(bookSlug: string) {
  return getBooks().find((book) => book.slug === bookSlug) ?? null;
}

export function resolveBookSlug(input: string): string {
  const normalized = normalizeBookName(input);
  const exists = bibleStructure.some(
    (book) => normalizeBookName(book.libro) === normalized,
  );

  return exists ? normalized : "";
}

export function readChapter(bookSlug: string, chapterNumber: number) {
  const key = `${bookSlug}:${chapterNumber}`;
  return chapterLookup.get(key) ?? [];
}

export function searchVerses(query: string, limit = 25) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  return verseIndex
    .filter((item) => item.searchText.includes(normalized))
    .slice(0, limit);
}

export function getLiturgyDay(date: string) {
  return liturgyDataset.lecturas.find((entry) => entry.fecha === date) ?? null;
}

export function getLiturgyMeta() {
  return {
    year: liturgyDataset.ano,
    generatedAt: liturgyDataset.fechaGeneracion,
    description: liturgyDataset.descripcion,
  };
}

export function getCuratedPassages() {
  return curatedPassages;
}

export function getDatasetStats() {
  const chapters = bibleStructure.reduce(
    (acc, book) => acc + book.capitulos.length,
    0,
  );
  const verses = verseIndex.length;

  return {
    versions: versions.length,
    books: bibleStructure.length,
    chapters,
    verses,
    liturgyDays: liturgyDataset.lecturas.length,
    curatedPassages: curatedPassages.length,
  };
}
