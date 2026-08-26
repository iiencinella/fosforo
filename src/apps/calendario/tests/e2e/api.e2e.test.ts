import { describe, expect, it } from "vitest";

const baseUrl = process.env.CALENDARIO_E2E_BASE_URL?.replace(/\/$/, "");
const e2e = describe.skipIf(!baseUrl);

async function get(path: string) {
  return fetch(`${baseUrl}${path}`);
}

e2e("Calendario HTTP E2E", () => {
  it("serves the public pages and widget", async () => {
    for (const path of ["/", "/widget/day"]) {
      expect((await get(path)).status, path).toBe(200);
    }
  });

  it("serves health with a controlled status", async () => {
    const response = await get("/api/health");
    const body = await response.json();

    expect([200, 503]).toContain(response.status);
    expect(["ok", "degraded", "error"]).toContain(body.status);
  });

  it("returns a daily contract and cache policy", async () => {
    const response = await get("/api/calendar/day?date=2026-05-20");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.requestedDate).toBe("2026-05-20");

    // La funcion emite `public, s-maxage=300, stale-while-revalidate=600`.
    // En Vercel el proxy CONSUME s-maxage/stale-while-revalidate para su CDN
    // y los elimina de la respuesta al cliente (queda `Cache-Control: public`
    // mas `x-vercel-cache`). Fuera de Vercel se ve la directiva completa.
    // https://vercel.com/docs/caching/cache-control-headers
    const cacheControl = response.headers.get("cache-control") ?? "";
    const edgeCacheable =
      cacheControl.includes("s-maxage=300") ||
      (cacheControl.includes("public") &&
        response.headers.has("x-vercel-cache"));
    expect(edgeCacheable).toBe(true);
  });

  it("returns a monthly contract", async () => {
    const response = await get("/api/calendar/month?year=2026&month=5");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.year).toBe(2026);
    expect(body.month).toBe(5);
    expect(body.days.length).toBeGreaterThan(28);
  });

  it("returns controlled validation errors", async () => {
    const invalidDate = await get("/api/calendar/day?date=2026-02-30");
    const invalidMonth = await get("/api/calendar/month?year=2026&month=13");

    expect(invalidDate.status).toBe(400);
    expect((await invalidDate.json()).code).toBe("CALENDAR_INVALID_DATE");
    expect(invalidMonth.status).toBe(400);
    expect((await invalidMonth.json()).code).toBe("CALENDAR_INVALID_MONTH");
  });
});
