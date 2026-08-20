import { beforeEach, describe, expect, it } from "vitest";
import {
  consumeAuthRateLimit,
  resetAuthRateLimitForTests,
} from "@/lib/rate-limit";

describe("auth rate limiting", () => {
  beforeEach(() => resetAuthRateLimitForTests());

  it("limits repeated attempts by scope and key", () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(consumeAuthRateLimit("login", "127.0.0.1")).toBe(true);
    }

    expect(consumeAuthRateLimit("login", "127.0.0.1")).toBe(false);
    expect(consumeAuthRateLimit("register", "127.0.0.1")).toBe(true);
  });
});
