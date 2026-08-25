import { describe, expect, it } from "vitest";
import {
  buildSearchDeepLink,
  filterVersesByReference,
  parseBibleReferenceQuery,
  resolveBookSlug,
} from "@/lib/data";

describe("data helpers", () => {
  it("resolves abbreviated book names", () => {
    expect(resolveBookSlug("Lc")).toBe("lucas");
    expect(resolveBookSlug("Jn")).toBe("juan");
  });

  it("parses compact bible references", () => {
    const parsed = parseBibleReferenceQuery("Lc 1,26-38");

    expect(parsed).toEqual({
      bookSlug: "lucas",
      chapter: 1,
      verseStart: 26,
      verseEnd: 38,
      normalized: "Lucas 1,26-38",
    });
  });

  it("parses chapter-only bible references", () => {
    const parsed = parseBibleReferenceQuery("Lucas 1");

    expect(parsed).toEqual({
      bookSlug: "lucas",
      chapter: 1,
      verseStart: undefined,
      verseEnd: undefined,
      normalized: "Lucas 1",
    });
  });

  it("rejects invalid ranges", () => {
    expect(parseBibleReferenceQuery("Lc 1,38-26")).toBeNull();
  });

  it("parses multi-range references like Salmo 78:56-59, 61-62", () => {
    const parsed = parseBibleReferenceQuery("Salmo 78:56-59, 61-62");

    expect(parsed).not.toBeNull();
    expect(parsed?.bookSlug).toBe("salmos");
    expect(parsed?.chapter).toBe(78);
    expect(parsed?.verseRanges).toEqual([
      { start: 56, end: 59 },
      { start: 61, end: 62 },
    ]);
    expect(parsed?.normalized).toBe("Salmos 78,56-59, 61-62");
  });

  it("parses multi-range with single verses", () => {
    const parsed = parseBibleReferenceQuery("Salmo 78:56-59, 61-62");

    expect(parsed).not.toBeNull();
    expect(parsed?.verseRanges).toEqual([
      { start: 56, end: 59 },
      { start: 61, end: 62 },
    ]);
  });

  it("parses multi-range with three ranges", () => {
    const parsed = parseBibleReferenceQuery("Salmo 78:56-59, 61-62, 65-67");

    expect(parsed).not.toBeNull();
    expect(parsed?.verseRanges).toEqual([
      { start: 56, end: 59 },
      { start: 61, end: 62 },
      { start: 65, end: 67 },
    ]);
  });

  it("exposes chapter end verse for cross-chapter references", () => {
    const parsed = parseBibleReferenceQuery("1 Co 12,31-13,13");

    expect(parsed).not.toBeNull();
    expect(parsed?.isCrossChapter).toBe(true);
    expect(parsed?.chapter).toBe(12);
    expect(parsed?.chapterEnd).toBe(13);
    expect(parsed?.chapterEndVerse).toBe(13);
  });

  it("filters verses by single range", () => {
    const parsed = parseBibleReferenceQuery("Juan 3,14-17");
    expect(parsed).not.toBeNull();

    const rows = [13, 14, 15, 16, 17, 18].map((verse) => ({
      chapter: 3,
      verse,
      text: `v${verse}`,
    }));

    expect(filterVersesByReference(rows, parsed!)).toEqual(rows.slice(1, 5));
  });

  it("filters verses by multi-range without gaps", () => {
    const parsed = parseBibleReferenceQuery("Salmo 78:9-11, 13-14");
    expect(parsed).not.toBeNull();

    const rows = [8, 9, 10, 11, 12, 13, 14, 15].map((verse) => ({
      chapter: 78,
      verse,
      text: `v${verse}`,
    }));

    expect(
      filterVersesByReference(rows, parsed!).map((row) => row.verse),
    ).toEqual([9, 10, 11, 13, 14]);
  });

  it("filters verses across chapters including end chapter verse limit", () => {
    const parsed = parseBibleReferenceQuery("1 Corintios 12,30-13,3");
    expect(parsed).not.toBeNull();

    const rows = [
      ...[29, 30, 31].map((verse) => ({
        chapter: 12,
        verse,
        text: `a${verse}`,
      })),
      ...[1, 2, 3, 4].map((verse) => ({
        chapter: 13,
        verse,
        text: `b${verse}`,
      })),
    ];

    expect(filterVersesByReference(rows, parsed!)).toEqual([
      { chapter: 12, verse: 30, text: "a30" },
      { chapter: 12, verse: 31, text: "a31" },
      { chapter: 13, verse: 1, text: "b1" },
      { chapter: 13, verse: 2, text: "b2" },
      { chapter: 13, verse: 3, text: "b3" },
    ]);
  });

  it("returns whole chapter when reference has no verse range", () => {
    const parsed = parseBibleReferenceQuery("Juan 2");
    expect(parsed).not.toBeNull();

    const rows = [
      { chapter: 1, verse: 1, text: "otro" },
      { chapter: 2, verse: 1, text: "a" },
      { chapter: 2, verse: 25, text: "b" },
    ];

    expect(filterVersesByReference(rows, parsed!)).toEqual([
      { chapter: 2, verse: 1, text: "a" },
      { chapter: 2, verse: 25, text: "b" },
    ]);
  });

  it("builds search deep link with encoded citation and version", () => {
    expect(buildSearchDeepLink("Juan 3,16", "pd")).toBe(
      "/?modo=busqueda&q=Juan+3%2C16&version=pd",
    );
    expect(buildSearchDeepLink("  amor  ", "pd")).toBe(
      "/?modo=busqueda&q=amor&version=pd",
    );
  });
});
