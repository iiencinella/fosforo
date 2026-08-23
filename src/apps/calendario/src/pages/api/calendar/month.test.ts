import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/pages/api/calendar/month";
import { getMonthCalendar } from "@/lib/calendar";

vi.mock("@/lib/calendar", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/calendar")>("@/lib/calendar");

  return {
    ...actual,
    getMonthCalendar: vi.fn(),
  };
});

describe("GET /api/calendar/month", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects months outside the supported calendar range", async () => {
    const response = await GET({
      url: new URL("http://localhost/api/calendar/month?year=2200&month=1"),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("CALENDAR_INVALID_MONTH");
    expect(getMonthCalendar).not.toHaveBeenCalled();
  });

  it("returns a date validation error separately from month validation", async () => {
    const response = await GET({
      url: new URL(
        "http://localhost/api/calendar/month?date=2026-02-30&year=2026&month=2",
      ),
    } as Parameters<typeof GET>[0]);

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("CALENDAR_INVALID_DATE");
  });

  it("does not expose infrastructure errors to clients", async () => {
    vi.mocked(getMonthCalendar).mockRejectedValue(
      new Error("secret database connection details"),
    );

    const response = await GET({
      url: new URL("http://localhost/api/calendar/month?year=2026&month=5"),
    } as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("CALENDAR_MONTH_ERROR");
    expect(body.message).not.toContain("secret database");
  });
});
