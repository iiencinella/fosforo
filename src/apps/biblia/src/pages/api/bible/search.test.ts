import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/pages/api/bible/search";
import { readChapterRpc, searchVersesRpc } from "@/db/supabase";
import { getEnabledBibleVersion } from "@/lib/server/bible-versions";
import { parseBibleReferenceQuery } from "@/lib/data";

vi.mock("@/db/supabase", () => ({
  readChapterRpc: vi.fn(),
  searchVersesRpc: vi.fn(),
}));

vi.mock("@/lib/server/bible-versions", () => ({
  getEnabledBibleVersion: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getDefaultVersion: () => ({ code: "pd" }),
  parseBibleReferenceQuery: vi.fn(),
}));

describe("GET /api/bible/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEnabledBibleVersion).mockResolvedValue({
      version: {
        code: "pd",
        name: "Pueblo",
        isEnabled: true,
        isInternalOnly: true,
      },
      errorMessage: null,
    });
  });

  it("parses biblical references and resolves range from read endpoint", async () => {
    vi.mocked(parseBibleReferenceQuery).mockReturnValue({
      bookSlug: "lucas",
      chapter: 1,
      verseStart: 26,
      verseEnd: 38,
      normalized: "Lucas 1,26-38",
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
      ],
      count: null,
      status: 200,
      statusText: "OK",
      error: null,
    } as any);

    const request = new Request(
      "http://localhost/api/bible/search?query=Lc%201,26-38",
    );
    const response = await GET({ request } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.normalizedReference).toBe("Lucas 1,26-38");
    expect(body.total).toBe(1);
    expect(body.results[0]?.verse).toBe(26);
    expect(searchVersesRpc).not.toHaveBeenCalled();
  });

  it("falls back to text search when query is not a bible reference", async () => {
    vi.mocked(parseBibleReferenceQuery).mockReturnValue(null);
    vi.mocked(searchVersesRpc).mockResolvedValue({
      success: true,
      data: [
        {
          version_code: "pd",
          book_slug: "juan",
          book_name: "Juan",
          chapter_number: 3,
          verse_number: 16,
          reference_label: "Juan 3,16",
          verse_text: "Porque tanto amo Dios...",
          rank: 0.9,
        },
      ],
      count: null,
      status: 200,
      statusText: "OK",
      error: null,
    } as any);

    const request = new Request("http://localhost/api/bible/search?query=amor");
    const response = await GET({ request } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.total).toBe(1);
    expect(body.results[0]?.reference).toBe("Juan 3,16");
    expect(readChapterRpc).not.toHaveBeenCalled();
  });
});
