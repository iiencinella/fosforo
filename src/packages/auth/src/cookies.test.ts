import { describe, expect, it } from "vitest";
import {
  buildSessionCookies,
  clearSessionCookies,
  getAccessCookieName,
  getAccessTokenFromRequest,
  getRefreshCookieName,
  getRefreshTokenFromRequest,
} from "./cookies.js";

describe("auth cookies", () => {
  it("devuelve cookie names esperados", () => {
    expect(getAccessCookieName()).toBe("fosforo_access_token");
    expect(getRefreshCookieName()).toBe("fosforo_refresh_token");
  });

  it("lee access token de Authorization: Bearer", () => {
    const request = new Request("https://example.com/", {
      headers: { authorization: "Bearer abc.def.ghi" },
    });
    expect(getAccessTokenFromRequest(request)).toBe("abc.def.ghi");
  });

  it("lee access token de cookie fosforo_access_token", () => {
    const request = new Request("https://example.com/", {
      headers: {
        cookie: "fosforo_access_token=token123; other=foo",
      },
    });
    expect(getAccessTokenFromRequest(request)).toBe("token123");
  });

  it("lee refresh token de cookie fosforo_refresh_token", () => {
    const request = new Request("https://example.com/", {
      headers: {
        cookie: "fosforo_refresh_token=refresh456",
      },
    });
    expect(getRefreshTokenFromRequest(request)).toBe("refresh456");
  });

  it("devuelve string vacio si no hay cookies ni auth header", () => {
    const request = new Request("https://example.com/");
    expect(getAccessTokenFromRequest(request)).toBe("");
    expect(getRefreshTokenFromRequest(request)).toBe("");
  });

  it("construye cookies de sesion con Path=/, HttpOnly, SameSite=Lax", () => {
    const cookies = buildSessionCookies(3600, "access", "refresh");
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain("fosforo_access_token=access");
    expect(cookies[0]).toContain("Max-Age=3600");
    expect(cookies[0]).toContain("Path=/");
    expect(cookies[0]).toContain("HttpOnly");
    expect(cookies[0]).toContain("SameSite=Lax");
    expect(cookies[0]).not.toContain("Secure");

    expect(cookies[1]).toContain("fosforo_refresh_token=refresh");
    expect(cookies[1]).toContain("Max-Age=");
    expect(cookies[1]).toContain("Path=/");
  });

  it("construye cookies de logout con Max-Age=0", () => {
    const cookies = clearSessionCookies();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain("Max-Age=0");
    expect(cookies[1]).toContain("Max-Age=0");
  });
});
