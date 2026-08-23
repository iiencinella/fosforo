import { describe, expect, it, vi } from "vitest";

vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const getSessionFromTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-supabase", () => ({
  getSessionFromToken: getSessionFromTokenMock,
  loginUser: vi.fn(),
}));

import { onRequest } from "@/middleware";
import { requireRole, requireSession } from "@/lib/authz";

function buildContext(path: string, headers: Record<string, string> = {}) {
  const url = new URL(`http://localhost${path}`);
  return {
    url,
    request: new Request(url, { headers }),
    redirect: (path: string, status = 302) =>
      new Response(null, { status, headers: { location: path } }),
    cookies: {},
    params: {},
  };
}

describe("middleware de sesion", () => {
  it("TC-014: redirects to /login when no token is present on protected path", async () => {
    const context = buildContext("/logs");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("TC-014: redirects to /login when session token is invalid", async () => {
    getSessionFromTokenMock.mockRejectedValue(new Error("LOG_SESSION_EXPIRED"));
    const context = buildContext("/logs", {
      cookie: "fosforo_access_token=invalid-token",
    });
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
  });

  it("allows public paths without session and sets security headers", async () => {
    const context = buildContext("/login");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'self'",
    );
  });
});

describe("requireRole / requireSession", () => {
  it("TC-015: denies access when user has no dev/ops role", async () => {
    getSessionFromTokenMock.mockResolvedValue({
      user: { id: "u1" },
      role: null,
    });
    const request = new Request("http://localhost/api/logs", {
      headers: { authorization: "Bearer token" },
    });

    await expect(requireRole(request, ["dev", "ops"])).rejects.toThrow(
      "LOG_ACCESS_DENIED",
    );
  });

  it("TC-015: denies access to ops-only resource for dev role", async () => {
    getSessionFromTokenMock.mockResolvedValue({
      user: { id: "u1" },
      role: "dev",
    });
    const request = new Request("http://localhost/api/dashboard/metrics", {
      headers: { authorization: "Bearer token" },
    });

    await expect(requireRole(request, ["ops"])).rejects.toThrow(
      "LOG_ACCESS_DENIED",
    );
  });

  it("allows access when role matches", async () => {
    getSessionFromTokenMock.mockResolvedValue({
      user: { id: "u1" },
      role: "ops",
    });
    const request = new Request("http://localhost/dashboard", {
      headers: { authorization: "Bearer token" },
    });

    const session = await requireRole(request, ["ops"]);
    expect(session.role).toBe("ops");
  });

  it("requires a session token", async () => {
    const request = new Request("http://localhost/logs");

    await expect(requireSession(request)).rejects.toThrow(
      "LOG_SESSION_EXPIRED",
    );
  });
});
