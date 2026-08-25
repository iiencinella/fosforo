import { beforeEach, describe, expect, it, vi } from "vitest";

const checkPortalSupabaseMock = vi.fn();

vi.mock("@/lib/submissions", () => ({
  checkPortalSupabase: () => checkPortalSupabaseMock(),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { GET as healthGET } from "@/pages/api/health";

beforeEach(() => {
  checkPortalSupabaseMock.mockReset();
});

describe("health del portal", () => {
  it("retorna ok cuando Supabase responde", async () => {
    checkPortalSupabaseMock.mockResolvedValue(true);

    const response = await healthGET({} as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.dependencies.supabase).toBe("ok");
  });

  it("degrada a 503 si la tabla no esta accesible", async () => {
    checkPortalSupabaseMock.mockResolvedValue(false);

    const response = await healthGET({} as never);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.dependencies.supabase).toBe("unavailable");
  });

  it("degrada a 503 (no 500) si faltan variables de entorno", async () => {
    checkPortalSupabaseMock.mockRejectedValue(
      new Error("Missing environment variable SUPABASE_URL"),
    );

    const response = await healthGET({} as never);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
  });
});
