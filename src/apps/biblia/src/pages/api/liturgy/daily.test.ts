import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLiturgyDayRpc } from "@/db/supabase";
import { GET } from "@/pages/api/liturgy/daily";

vi.mock("@/db/supabase", () => ({
  getLiturgyDayRpc: vi.fn(),
}));

vi.mock("@/lib/data", () => ({
  getLiturgyMeta: () => ({
    year: 2026,
    generatedAt: "test",
    description: "test",
  }),
}));

describe("GET /api/liturgy/daily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for an unsupported region", async () => {
    const response = await GET({
      request: new Request(
        "http://localhost/api/liturgy/daily?date=2026-01-01&region=US",
      ),
    } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BIBLIA_LITURGY_UNSUPPORTED_SCOPE");
    expect(getLiturgyDayRpc).not.toHaveBeenCalled();
  });

  it("returns 404 for a valid date without readings", async () => {
    vi.mocked(getLiturgyDayRpc).mockResolvedValue({
      data: [],
      error: null,
    } as any);

    const response = await GET({
      request: new Request(
        "http://localhost/api/liturgy/daily?date=1900-01-01",
      ),
    } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.code).toBe("BIBLIA_LITURGY_NOT_FOUND");
  });

  it("returns a controlled error when Supabase liturgy fails", async () => {
    vi.mocked(getLiturgyDayRpc).mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    } as any);

    const response = await GET({
      request: new Request(
        "http://localhost/api/liturgy/daily?date=2026-01-01",
      ),
    } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.code).toBe("BIBLIA_LITURGY_ERROR");
  });
});
