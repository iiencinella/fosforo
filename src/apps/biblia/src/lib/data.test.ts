import { describe, expect, it } from "vitest";
import { parseBibleReferenceQuery, resolveBookSlug } from "@/lib/data";

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
});
