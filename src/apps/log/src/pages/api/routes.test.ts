import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  getById: vi.fn(),
  metrics: vi.fn(),
}));

const requireRoleMock = vi.hoisted(() => vi.fn());
const loginUserMock = vi.hoisted(() => vi.fn());
const buildSessionCookiesMock = vi.hoisted(() => vi.fn());
const clearSessionCookiesMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());
const getAccessTokenFromRequestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/log-repository", () => ({
  createLogRepository: () => repoMocks,
}));

vi.mock("@/lib/authz", () => ({
  requireRole: requireRoleMock,
  requireSession: vi.fn(),
}));

vi.mock("@/lib/auth-supabase", () => ({
  loginUser: loginUserMock,
  getSessionFromToken: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  buildSessionCookies: buildSessionCookiesMock,
  clearSessionCookies: clearSessionCookiesMock,
}));

vi.mock("@/lib/auth", () => ({
  getAccessTokenFromRequest: getAccessTokenFromRequestMock,
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseClient: vi.fn(),
  getSupabaseServiceClient: () => ({
    auth: { admin: { signOut: signOutMock } },
  }),
}));

import { GET as healthGET } from "@/pages/api/health";
import { GET as logDetailGET } from "@/pages/api/logs/[id]";
import { GET as metricsGET } from "@/pages/api/dashboard/metrics";
import { POST as loginPOST } from "@/pages/api/auth/login";
import { POST as logoutPOST } from "@/pages/api/auth/logout";

describe("GET /api/health", () => {
  it("returns ok with service info", async () => {
    const response = await healthGET({} as never);

    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; service: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBe("log");
  });
});

describe("GET /api/logs/[id]", () => {
  beforeEach(() => {
    requireRoleMock.mockReset();
    repoMocks.getById.mockReset();
  });

  it("TC-009: returns 404 when log does not exist", async () => {
    requireRoleMock.mockResolvedValue({ role: "dev" });
    repoMocks.getById.mockResolvedValue(null);

    const response = await logDetailGET({
      request: new Request("http://localhost/api/logs/x"),
      params: { id: "x" },
    } as never);

    expect(response.status).toBe(404);
  });

  it("returns entry when found", async () => {
    requireRoleMock.mockResolvedValue({ role: "ops" });
    repoMocks.getById.mockResolvedValue({
      id: "abc",
      app: "portal",
      level: "error",
      message: "m",
      timestamp: new Date().toISOString(),
    });

    const response = await logDetailGET({
      request: new Request("http://localhost/api/logs/abc"),
      params: { id: "abc" },
    } as never);

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      entry: { id: string };
    };
    expect(body.entry.id).toBe("abc");
  });

  it("returns 400 when id param is missing", async () => {
    requireRoleMock.mockResolvedValue({ role: "dev" });

    const response = await logDetailGET({
      request: new Request("http://localhost/api/logs/"),
      params: {},
    } as never);

    expect(response.status).toBe(400);
  });
});

describe("GET /api/dashboard/metrics", () => {
  beforeEach(() => {
    requireRoleMock.mockReset();
    repoMocks.metrics.mockReset();
  });

  it("denies access to non-ops roles", async () => {
    requireRoleMock.mockRejectedValue(new Error("LOG_ACCESS_DENIED"));

    const response = await metricsGET({
      request: new Request("http://localhost/api/dashboard/metrics"),
    } as never);

    expect(response.status).toBe(403);
  });

  it("returns metrics, series and alerts for ops", async () => {
    requireRoleMock.mockResolvedValue({ role: "ops" });
    repoMocks.metrics.mockResolvedValue({
      metrics: { totalLogs: 1, errorCount24h: 0, errorRate: 0, topApps: [] },
      hourlySeries: [{ label: "10:00", count: 1 }],
      alerts: { threshold: 10, triggered: [] },
    });

    const response = await metricsGET({
      request: new Request("http://localhost/api/dashboard/metrics"),
    } as never);

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      metrics: { totalLogs: number };
      hourlySeries: unknown[];
      alerts: unknown;
    };
    expect(body.metrics.totalLogs).toBe(1);
    expect(body.hourlySeries.length).toBe(1);
  });
});

function buildFormRequest() {
  const form = new FormData();
  form.set("email", "ops@fosforo.com");
  form.set("password", "supersecret1");

  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    loginUserMock.mockReset();
    buildSessionCookiesMock.mockReset();
  });

  it("redirects to /dashboard for ops role", async () => {
    loginUserMock.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
      expiresIn: 3600,
      userId: "u1",
      email: "ops@fosforo.com",
      role: "ops",
    });
    buildSessionCookiesMock.mockReturnValue(["a=1; HttpOnly"]);

    const response = await loginPOST({ request: buildFormRequest() } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/dashboard");
    expect(response.headers.getSetCookie?.().length ?? 0).toBeGreaterThan(0);
  });

  it("redirects to /logs for dev role", async () => {
    loginUserMock.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
      expiresIn: 3600,
      userId: "u1",
      email: "dev@fosforo.com",
      role: "dev",
    });
    buildSessionCookiesMock.mockReturnValue([]);

    const response = await loginPOST({ request: buildFormRequest() } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/logs");
  });

  it("redirects to error when credentials are invalid", async () => {
    loginUserMock.mockRejectedValue(new Error("LOG_INVALID_CREDENTIALS"));

    const response = await loginPOST({ request: buildFormRequest() } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain(
      "/login?error=invalid_credentials",
    );
  });

  it("redirects to access_denied when role is not dev/ops", async () => {
    loginUserMock.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
      expiresIn: 3600,
      userId: "u1",
      email: "x@fosforo.com",
      role: null,
    });

    const response = await loginPOST({ request: buildFormRequest() } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain(
      "/login?error=access_denied",
    );
  });
});

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    signOutMock.mockReset();
    clearSessionCookiesMock.mockReset();
    getAccessTokenFromRequestMock.mockReset();
  });

  it("revokes token server-side and clears cookies", async () => {
    getAccessTokenFromRequestMock.mockReturnValue("token-abc");
    signOutMock.mockResolvedValue({});
    clearSessionCookiesMock.mockReturnValue(["a=; Max-Age=0"]);

    const response = await logoutPOST({
      request: new Request("http://localhost/api/auth/logout", {
        method: "POST",
      }),
    } as never);

    expect(signOutMock).toHaveBeenCalledWith("token-abc");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
  });

  it("clears cookies even without a token", async () => {
    getAccessTokenFromRequestMock.mockReturnValue(null);
    clearSessionCookiesMock.mockReturnValue([]);

    const response = await logoutPOST({
      request: new Request("http://localhost/api/auth/logout", {
        method: "POST",
      }),
    } as never);

    expect(signOutMock).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
  });
});
