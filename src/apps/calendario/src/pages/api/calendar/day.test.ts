import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/pages/api/calendar/day";
import { getDayByDate } from "@/lib/calendar";

vi.mock("@/lib/calendar", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/calendar")>("@/lib/calendar");

  return {
    ...actual,
    getDayByDate: vi.fn(),
  };
});

describe("GET /api/calendar/day", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects malformed dates without querying Supabase", async () => {
    const response = await GET({
      url: new URL("http://localhost/api/calendar/day?date=2026-13-01"),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("CALENDAR_INVALID_DATE");
    expect(getDayByDate).not.toHaveBeenCalled();
  });

  it("returns a controlled 404 when no day can be resolved", async () => {
    vi.mocked(getDayByDate).mockResolvedValue(null);

    const response = await GET({
      url: new URL("http://localhost/api/calendar/day?date=2026-05-20"),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe("CALENDAR_DAY_NOT_FOUND");
    expect(response.headers.get("cache-control")).toContain("s-maxage=300");
  });

  it("does not expose infrastructure errors to clients", async () => {
    vi.mocked(getDayByDate).mockRejectedValue(
      new Error("secret database connection details"),
    );

    const response = await GET({
      url: new URL("http://localhost/api/calendar/day?date=2026-05-20"),
    } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("CALENDAR_DAY_ERROR");
    expect(body.message).not.toContain("secret database");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
