import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getSamplingConfig: vi.fn(),
  insertEvent: vi.fn(),
  upsertSession: vi.fn(),
}));

const clientMocks = vi.hoisted(() => ({
  buildRumClientKey: vi.fn(),
  hashUserAgent: vi.fn(),
}));

vi.mock("@/lib/rum-repository", () => ({
  RUM_RATE_LIMIT_PER_MINUTE: 1000,
  RUM_RATE_LIMIT_WINDOW_SECONDS: 60,
  createRumRepository: () => repoMocks,
}));

vi.mock("@/lib/rum-client", () => clientMocks);

import { POST } from "@/pages/api/rum";

const {
  checkRateLimit: checkRateLimitMock,
  getSamplingConfig: getSamplingConfigMock,
  insertEvent: insertEventMock,
  upsertSession: upsertSessionMock,
} = repoMocks;

function buildPostRequest(body: unknown) {
  return new Request("http://localhost/api/rum", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  app: "misal",
  event_name: "misal.lectio.started",
  page_path: "/dia/2026-09-06",
  session_id_anon: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
  metadata: { lectura: "mc 5,1-12" },
};

describe("POST /api/rum (TC-LOG-RUM-002)", () => {
  beforeEach(() => {
    checkRateLimitMock.mockReset();
    getSamplingConfigMock.mockReset();
    insertEventMock.mockReset();
    upsertSessionMock.mockReset();
    clientMocks.buildRumClientKey.mockReset();
    clientMocks.hashUserAgent.mockReset();

    clientMocks.buildRumClientKey.mockReturnValue("client-key-hash");
    clientMocks.hashUserAgent.mockReturnValue("ua-hash");
    checkRateLimitMock.mockResolvedValue(true);
    getSamplingConfigMock.mockResolvedValue({
      pageview: 1,
      custom: 1,
      error: 1,
    });
    insertEventMock.mockResolvedValue("event-uuid");
  });

  it("devuelve 429 cuando el rate limit no permite el request (SEC-LOG-RUM-003)", async () => {
    checkRateLimitMock.mockResolvedValue(false);

    const response = await POST({
      request: buildPostRequest(validPayload),
    } as never);

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 con JSON invalido", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/rum", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "no-json",
      }),
    } as never);

    expect(response.status).toBe(400);
  });

  it("devuelve 422 con payload invalido", async () => {
    const response = await POST({
      request: buildPostRequest({
        app: "misal",
        event_name: "evento-inexistente",
        session_id_anon: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
      }),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("RUM_INVALID_PAYLOAD");
  });

  it("devuelve 422 cuando la metadata contiene PII (TC-LOG-RUM-014)", async () => {
    const response = await POST({
      request: buildPostRequest({
        ...validPayload,
        metadata: { contacto: "juan@ejemplo.com" },
      }),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("RUM_PII_DETECTED");
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("devuelve 422 cuando la metadata excede el limite", async () => {
    const response = await POST({
      request: buildPostRequest({
        ...validPayload,
        metadata: { texto: "x".repeat(10_000) },
      }),
    } as never);

    expect(response.status).toBe(422);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("RUM_METADATA_TOO_LARGE");
  });

  it("descarta el evento sin consentimiento sin insertarlo (TC-LOG-RUM-007)", async () => {
    const response = await POST({
      request: buildPostRequest({ ...validPayload, has_consent: false }),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { dropped: string };
    expect(json.dropped).toBe("no_consent");
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("descarta el evento por sampling sin insertarlo (TC-LOG-RUM-005)", async () => {
    getSamplingConfigMock.mockResolvedValue({
      pageview: 1,
      custom: 0,
      error: 1,
    });

    const response = await POST({
      request: buildPostRequest(validPayload),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { dropped: string };
    expect(json.dropped).toBe("sampling");
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("inserta el evento y actualiza la sesion con payload valido", async () => {
    const response = await POST({
      request: buildPostRequest(validPayload),
    } as never);

    expect(response.status).toBe(201);
    const json = (await response.json()) as { ok: boolean; id: string };
    expect(json.ok).toBe(true);
    expect(json.id).toBe("event-uuid");
    expect(insertEventMock).toHaveBeenCalledTimes(1);
    expect(insertEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        app: "misal",
        event_name: "misal.lectio.started",
        has_consent: true,
      }),
      "ua-hash",
    );
    expect(upsertSessionMock).toHaveBeenCalledTimes(1);
    expect(upsertSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        app: "misal",
        sessionId: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
        eventName: "misal.lectio.started",
      }),
    );
  });

  it("descarta eventos pageview del SDK sin consentimiento implicito", async () => {
    const response = await POST({
      request: buildPostRequest({
        app: "portal",
        event_name: "pageview",
        page_path: "/",
        session_id_anon: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
        has_consent: false,
      }),
    } as never);

    expect(response.status).toBe(200);
    expect(insertEventMock).not.toHaveBeenCalled();
  });
});
