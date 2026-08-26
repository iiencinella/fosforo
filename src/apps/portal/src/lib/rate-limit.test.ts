import { describe, expect, it } from "vitest";
import { getIp, isRateLimited } from "@/lib/rate-limit";

function requestWithIp(ip: string): Request {
  return new Request("https://portal.test/api/feedback", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rate-limit del portal", () => {
  it("permite hasta 5 requests por ventana y bloquea el sexto", () => {
    const now = Date.now();
    const ip = "203.0.113.10";

    const results = Array.from({ length: 6 }, () => isRateLimited(ip, now));

    expect(results).toEqual([false, false, false, false, false, true]);
  });

  it("reinicia la ventana al vencerse el plazo", () => {
    const base = Date.now();
    const ip = "203.0.113.11";

    for (let i = 0; i < 5; i += 1) {
      isRateLimited(ip, base);
    }
    expect(isRateLimited(ip, base)).toBe(true);

    // Ventana nueva: vuelve a permitir.
    expect(isRateLimited(ip, base + 60_001)).toBe(false);
  });

  it("cada IP tiene su propio contador", () => {
    const now = Date.now();
    for (let i = 0; i < 5; i += 1) {
      isRateLimited("203.0.113.12", now);
    }

    expect(isRateLimited("203.0.113.12", now)).toBe(true);
    expect(isRateLimited("198.51.100.7", now)).toBe(false);
  });

  it("no bloquea cuando no puede determinarse la IP", () => {
    expect(isRateLimited("unknown", Date.now())).toBe(false);
    expect(getIp(new Request("https://portal.test"))).toBe("unknown");
    expect(
      getIp(
        new Request("https://portal.test", {
          headers: { "x-forwarded-for": "203.0.113.99, 10.0.0.1" },
        }),
      ),
    ).toBe("203.0.113.99");
  });
});
