import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  insertVital: vi.fn(),
}));

const clientMocks = vi.hoisted(() => ({
  buildRumClientKey: vi.fn(),
}));

vi.mock("@/lib/rum-repository", () => ({
  RUM_RATE_LIMIT_PER_MINUTE: 1000,
  RUM_RATE_LIMIT_WINDOW_SECONDS: 60,
  createRumRepository: () => repoMocks,
}));

vi.mock("@/lib/rum-client", () => clientMocks);

import { POST } from "@/pages/api/rum/vitals";

const { checkRateLimit: checkRateLimitMock, insertVital: insertVitalMock } =
  repoMocks;

function buildPostRequest(body: unknown) {
  return new Request("http://localhost/api/rum/vitals", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validVital = {
  app: "misal",
  page_path: "/dia/2026-09-06",
  metric_name: "LCP",
  metric_value: 1840,
  rating: "good",
  session_id_anon: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
};

describe("POST /api/rum/vitals (TC-LOG-RUM-003)", () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    insertVitalMock.mockReset();
    clientMocks.buildRumClientKey.mockReset();

    clientMocks.buildRumClientKey.mockReturnValue("client-key-hash");
    checkRateLimitMock.mockResolvedValue(true);
    insertVitalMock.mockResolvedValue("vital-uuid");
  });

  it("inserta un vital valido y devuelve 201", async () => {
    const response = await POST({
      request: buildPostRequest(validVital),
    } as never);

    expect(response.status).toBe(201);
    const json = (await response.json()) as { ok: boolean; id: string };
    expect(json.ok).toBe(true);
    expect(json.id).toBe("vital-uuid");
    expect(insertVitalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        app: "misal",
        metric_name: "LCP",
        metric_value: 1840,
        rating: "good",
      }),
    );
  });

  it("devuelve 429 cuando el rate limit no permite el request", async () => {
    checkRateLimitMock.mockResolvedValue(false);

    const response = await POST({
      request: buildPostRequest(validVital),
    } as never);

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(insertVitalMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 con JSON invalido", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/rum/vitals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "no-json",
      }),
    } as never);

    expect(response.status).toBe(400);
  });

  it("devuelve 422 con metric_name invalido", async () => {
    const response = await POST({
      request: buildPostRequest({ ...validVital, metric_name: "TTI" }),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("RUM_INVALID_PAYLOAD");
  });

  it("devuelve 422 con rating invalido", async () => {
    const response = await POST({
      request: buildPostRequest({ ...validVital, rating: "excelente" }),
    } as never);

    expect(response.status).toBe(422);
  });

  it("devuelve 422 con PII en page_url", async () => {
    const response = await POST({
      request: buildPostRequest({
        ...validVital,
        page_url: "https://misal.app/?usuario=jose@ejemplo.com",
      }),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("RUM_PII_DETECTED");
    expect(insertVitalMock).not.toHaveBeenCalled();
  });
});
