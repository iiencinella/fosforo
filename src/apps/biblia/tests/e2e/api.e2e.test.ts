import { describe, expect, it } from "vitest";

const baseUrl = process.env.BIBLIA_E2E_BASE_URL?.replace(/\/$/, "");
const e2e = describe.skipIf(!baseUrl);

async function get(path: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`);
}

e2e("Biblia HTTP E2E", () => {
  it("serves the main public pages", async () => {
    for (const path of ["/", "/lectura", "/busqueda", "/liturgia", "/estado"]) {
      const response = await get(path);
      expect(response.status, path).toBe(200);
    }
  });

  it("reports the health state and dependency contract", async () => {
    const response = await get("/api/health");
    const body = await response.json();

    expect([200, 503]).toContain(response.status);
    expect(body.service).toBe("biblia");
    expect(["ok", "degraded"]).toContain(body.status);
  });

  it("returns enabled versions", async () => {
    const response = await get("/api/bible/versions");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.versions.length).toBeGreaterThan(0);
  });

  it("returns controlled errors for invalid reading input", async () => {
    const response = await get("/api/bible/read?book=unknown&chapter=0");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BIBLIA_INVALID_REFERENCE");
  });

  it("returns controlled errors for invalid search input", async () => {
    const response = await get("/api/bible/search?query=a");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BIBLIA_SEARCH_INVALID_QUERY");
  });

  it("returns an empty-state response for a date without liturgy", async () => {
    const response = await get("/api/liturgy/daily?date=1900-01-01");
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.code).toBe("BIBLIA_LITURGY_NOT_FOUND");
  });

  it("rejects an unsupported liturgy scope", async () => {
    const response = await get("/api/liturgy/daily?date=2026-01-01&region=US");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("BIBLIA_LITURGY_UNSUPPORTED_SCOPE");
  });

  it("protects the ingestion endpoint", async () => {
    const response = await fetch(`${baseUrl}/api/internal/ingestion/run`, {
      method: "POST",
      headers: { Origin: baseUrl as string },
    });
    const body = await response.json();

    expect([401, 503]).toContain(response.status);
    expect([
      "BIBLIA_INGESTION_UNAUTHORIZED",
      "BIBLIA_INGESTION_KEY_NOT_CONFIGURED",
    ]).toContain(body.code);
  });
});
