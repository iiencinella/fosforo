import { describe, expect, it } from "vitest";
import { buildSessionCookies, clearSessionCookies } from "@/lib/session";

describe("buildSessionCookies", () => {
  it("creates access and refresh cookies with httpOnly", () => {
    const cookies = buildSessionCookies(3600, "access-token", "refresh-token");

    expect(cookies.length).toBe(2);
    expect(cookies[0]).toContain("fosforo_access_token=access-token");
    expect(cookies[0]).toContain("Max-Age=3600");
    expect(cookies[1]).toContain("fosforo_refresh_token=refresh-token");
    for (const cookie of cookies) {
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Lax");
      expect(cookie).toContain("Path=/");
    }
  });
});

describe("clearSessionCookies", () => {
  it("expires both session cookies", () => {
    const cookies = clearSessionCookies();

    expect(cookies.length).toBe(2);
    for (const cookie of cookies) {
      expect(cookie).toMatch(/Max-Age=0/i);
    }
    expect(cookies[0]).toContain("fosforo_access_token=");
    expect(cookies[1]).toContain("fosforo_refresh_token=");
  });
});
