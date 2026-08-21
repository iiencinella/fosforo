import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  verifyApiKey: vi.fn(),
  checkRateLimit: vi.fn(),
  insert: vi.fn(),
  list: vi.fn(),
}));

const requireRoleMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/log-repository", () => {
  return {
    RATE_LIMIT_PER_MINUTE: 100,
    RATE_LIMIT_WINDOW_SECONDS: 60,
    createLogRepository: () => repoMocks,
  };
});

vi.mock("@/lib/authz", () => ({
  requireRole: requireRoleMock,
  requireSession: vi.fn(),
}));

import { GET, POST } from "@/pages/api/logs";

const {
  verifyApiKey: verifyApiKeyMock,
  checkRateLimit: checkRateLimitMock,
  insert: insertMock,
  list: listMock,
} = repoMocks;

function buildPostRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/logs", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  app: "portal",
  level: "error",
  message: "Connection timeout",
};

describe("POST /api/logs", () => {
  beforeEach(() => {
    verifyApiKeyMock.mockReset();
    checkRateLimitMock.mockReset();
    insertMock.mockReset();
    listMock.mockReset();
    requireRoleMock.mockReset();
  });

  it("TC-005: returns 401 when API key header is missing", async () => {
    const response = await POST({
      request: buildPostRequest(validPayload),
    } as never);

    expect(response.status).toBe(401);
    expect(verifyApiKeyMock).not.toHaveBeenCalled();
  });

  it("TC-004: returns 401 when API key is invalid", async () => {
    verifyApiKeyMock.mockResolvedValue(null);

    const response = await POST({
      request: buildPostRequest(validPayload, {
        "x-api-key": "invalid-key-value",
      }),
    } as never);

    expect(response.status).toBe(401);
    expect(verifyApiKeyMock).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    verifyApiKeyMock.mockResolvedValue({
      id: "key-1",
      key_hash: "hash",
      app_name: "portal",
      is_active: true,
    });
    checkRateLimitMock.mockResolvedValue(false);

    const response = await POST({
      request: buildPostRequest(validPayload, { "x-api-key": "valid-api-key" }),
    } as never);

    expect(response.status).toBe(429);
    expect(checkRateLimitMock).toHaveBeenCalledWith("key-1");
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON payload", async () => {
    verifyApiKeyMock.mockResolvedValue({
      id: "key-1",
      key_hash: "hash",
      app_name: "portal",
      is_active: true,
    });
    checkRateLimitMock.mockResolvedValue(true);

    const request = new Request("http://localhost/api/logs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "valid-api-key",
      },
      body: "{not-json",
    });

    const response = await POST({ request } as never);

    expect(response.status).toBe(400);
  });

  it("returns 422 for payload failing validation", async () => {
    verifyApiKeyMock.mockResolvedValue({
      id: "key-1",
      key_hash: "hash",
      app_name: "portal",
      is_active: true,
    });
    checkRateLimitMock.mockResolvedValue(true);

    const response = await POST({
      request: buildPostRequest(
        { app: "portal", level: "critical", message: "x" },
        { "x-api-key": "valid-api-key" },
      ),
    } as never);

    expect(response.status).toBe(422);
  });

  it("returns 201 with log id on success", async () => {
    verifyApiKeyMock.mockResolvedValue({
      id: "key-1",
      key_hash: "hash",
      app_name: "portal",
      is_active: true,
    });
    checkRateLimitMock.mockResolvedValue(true);
    insertMock.mockResolvedValue({ id: "log-123" });

    const response = await POST({
      request: buildPostRequest(validPayload, { "x-api-key": "valid-api-key" }),
    } as never);

    expect(response.status).toBe(201);
    const body = (await response.json()) as { ok: boolean; id: string };
    expect(body.ok).toBe(true);
    expect(body.id).toBe("log-123");
    expect(insertMock).toHaveBeenCalledTimes(1);
  });
});

describe("GET /api/logs", () => {
  beforeEach(() => {
    listMock.mockReset();
    requireRoleMock.mockReset();
  });

  function buildGetRequest(query = "") {
    return new Request(`http://localhost/api/logs${query}`);
  }

  it("TC-006: returns paginated data with total", async () => {
    requireRoleMock.mockResolvedValue({ role: "dev" });
    listMock.mockResolvedValue({
      data: [
        {
          id: "a",
          app: "portal",
          level: "error",
          message: "x",
          timestamp: new Date().toISOString(),
        },
      ],
      total: 120,
      page: 1,
      limit: 50,
    });

    const response = await GET({
      request: buildGetRequest(),
      url: new URL("http://localhost/api/logs"),
    } as never);

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: unknown[];
      total: number;
      page: number;
      limit: number;
    };
    expect(body.ok).toBe(true);
    expect(body.total).toBe(120);
    expect(body.limit).toBe(50);
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 50 }),
    );
  });

  it("TC-007/009: forwards level and date filters to repository", async () => {
    requireRoleMock.mockResolvedValue({ role: "ops" });
    listMock.mockResolvedValue({ data: [], total: 0, page: 2, limit: 20 });

    const response = await GET({
      request: buildGetRequest(
        "?level=error&app=portal&since=2026-08-01T00:00&until=2026-08-02T00:00&page=2&limit=20",
      ),
      url: new URL(
        "http://localhost/api/logs?level=error&app=portal&since=2026-08-01T00:00&until=2026-08-02T00:00&page=2&limit=20",
      ),
    } as never);

    expect(response.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "error",
        app: "portal",
        since: "2026-08-01T00:00",
        until: "2026-08-02T00:00",
        page: 2,
        limit: 20,
      }),
    );
  });

  it("returns 403 when role check fails", async () => {
    requireRoleMock.mockRejectedValue(new Error("LOG_ACCESS_DENIED"));

    const response = await GET({
      request: buildGetRequest(),
      url: new URL("http://localhost/api/logs"),
    } as never);

    expect(response.status).toBe(403);
    expect(listMock).not.toHaveBeenCalled();
  });
});
