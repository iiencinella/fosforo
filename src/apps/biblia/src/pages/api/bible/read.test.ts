import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/pages/api/bible/read";
import { readChapterRpc } from "@/db/supabase";
import { getEnabledBibleVersion } from "@/lib/server/bible-versions";

vi.mock("@/db/supabase", () => ({
  readChapterRpc: vi.fn(),
}));

vi.mock("@/lib/server/bible-versions", () => ({
  getEnabledBibleVersion: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getDefaultVersion: () => ({ code: "pd" }),
  resolveBookSlug: (input: string) =>
    input.trim().toLowerCase() ? "lucas" : "",
}));

describe("GET /api/bible/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid verse ranges", async () => {
    const request = new Request(
      "http://localhost/api/bible/read?book=lucas&chapter=1&verseStart=38&verseEnd=26",
    );

    const response = await GET({ request } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BIBLIA_INVALID_REFERENCE");
  });

  it("filters chapter verses by verseStart and verseEnd", async () => {
    vi.mocked(getEnabledBibleVersion).mockResolvedValue({
      version: {
        code: "pd",
        name: "Pueblo",
        isEnabled: true,
        isInternalOnly: true,
      },
      errorMessage: null,
    });

    vi.mocked(readChapterRpc).mockResolvedValue({
      success: true,
      data: [
        {
          version_code: "pd",
          book_slug: "lucas",
          book_name: "Lucas",
          chapter_number: 1,
          verse_number: 25,
          verse_text: "Verso 25",
        },
        {
          version_code: "pd",
          book_slug: "lucas",
          book_name: "Lucas",
          chapter_number: 1,
          verse_number: 26,
          verse_text: "Verso 26",
        },
        {
          version_code: "pd",
          book_slug: "lucas",
          book_name: "Lucas",
          chapter_number: 1,
          verse_number: 27,
          verse_text: "Verso 27",
        },
      ],
      count: null,
      status: 200,
      statusText: "OK",
      error: null,
    } as any);

    const request = new Request(
      "http://localhost/api/bible/read?book=lucas&chapter=1&verseStart=26&verseEnd=26",
    );

    const response = await GET({ request } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.verseStart).toBe(26);
    expect(body.verseEnd).toBe(26);
    expect(body.verses).toHaveLength(1);
    expect(body.verses[0]?.verse).toBe(26);
  });

  it("returns a controlled error when Supabase read fails", async () => {
    vi.mocked(getEnabledBibleVersion).mockResolvedValue({
      version: {
        code: "pd",
        name: "Pueblo",
        isEnabled: true,
        isInternalOnly: true,
      },
      errorMessage: null,
    });
    vi.mocked(readChapterRpc).mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    } as any);

    const response = await GET({
      request: new Request(
        "http://localhost/api/bible/read?book=lucas&chapter=1",
      ),
    } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.code).toBe("BIBLIA_READ_ERROR");
  });
});
