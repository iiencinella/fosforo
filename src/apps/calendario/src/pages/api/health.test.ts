import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/pages/api/health";
import { getCalendarHealth } from "@/lib/calendar";

vi.mock("@/lib/calendar", () => ({
  getCalendarHealth: vi.fn(),
}));

describe("GET /api/health", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 200 for a healthy dataset", async () => {
    vi.mocked(getCalendarHealth).mockResolvedValue({
      status: "ok",
      totalDays: 1095,
      totalProfiles: 365,
      hasExactToday: true,
      hasProfileToday: true,
    } as any);

    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe("ok");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 for a degraded dataset", async () => {
    vi.mocked(getCalendarHealth).mockResolvedValue({
      status: "degraded",
      totalDays: 0,
      totalProfiles: 0,
      hasExactToday: false,
      hasProfileToday: false,
    } as any);

    const response = await GET({} as Parameters<typeof GET>[0]);

    expect(response.status).toBe(503);
    expect((await response.json()).status).toBe("degraded");
  });

  it("does not expose infrastructure errors", async () => {
    vi.mocked(getCalendarHealth).mockRejectedValue(
      new Error("secret database connection details"),
    );

    const response = await GET({} as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).not.toContain("secret database");
  });
});
