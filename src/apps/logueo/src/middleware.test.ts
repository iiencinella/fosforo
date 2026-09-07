import { describe, expect, it, vi } from "vitest";

vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const getSessionFromTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-supabase", () => ({
  getSessionFromToken: getSessionFromTokenMock,
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  revokeSession: vi.fn(),
}));

import { onRequest } from "@/middleware";

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

describe("middleware de sesion (SEC-AUTH)", () => {
  it("redirige a /login sin token en rutas protegidas", async () => {
    const context = buildContext("/");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("redirige a /login con token invalido", async () => {
    getSessionFromTokenMock.mockRejectedValue(
      new Error("LOGUEO_SESSION_EXPIRED"),
    );
    const context = buildContext("/", {
      cookie: "fosforo_access_token=invalid-token",
    });
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
  });

  it("permite rutas publicas sin sesion y fija secure headers", async () => {
    const context = buildContext("/login");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'self'",
    );
  });

  it("/register es publica", async () => {
    const context = buildContext("/register");
    const next = vi.fn(async () => new Response("ok"));

    await onRequest(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("/api/ es publica (endpoints validan sesion por su cuenta)", async () => {
    const context = buildContext("/api/auth/session");
    const next = vi.fn(async () => new Response("ok"));

    await onRequest(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
