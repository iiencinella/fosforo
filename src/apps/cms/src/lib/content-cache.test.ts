import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CACHE_TTL_MAX_MS,
  cacheKeyFor,
  clearCacheForTests,
  defaultCacheTtlMs,
  extractApiKey,
  getFromCache,
  hashApiKey,
  invalidateContentType,
  setInCache,
} from "@/lib/content-cache";

beforeEach(() => {
  clearCacheForTests();
  vi.unstubAllEnvs();
});

afterEach(() => {
  clearCacheForTests();
  vi.unstubAllEnvs();
});

describe("cache en memoria (FR-CMS-007, ADR-CMS-004)", () => {
  it("set/get roundtrip", () => {
    setInCache("k", { a: 1 }, 60_000);
    expect(getFromCache<{ a: number }>("k")).toEqual({ a: 1 });
  });

  it("expira por TTL", () => {
    vi.useFakeTimers();
    setInCache("k", "v", 1_000);
    vi.advanceTimersByTime(1_500);
    expect(getFromCache("k")).toBeNull();
    vi.useRealTimers();
  });

  it("clamp del TTL al maximo de 5 minutos (RB-CMS-010)", () => {
    vi.useFakeTimers();
    setInCache("k", "v", CACHE_TTL_MAX_MS * 10);
    // Si el clamp no existiera, el valor seguiria vivo a los 6 minutos.
    vi.advanceTimersByTime(CACHE_TTL_MAX_MS + 1_000);
    expect(getFromCache("k")).toBeNull();
    vi.useRealTimers();
  });

  it("invalidateContentType borra solo las claves del tipo", () => {
    setInCache("cms:oracion:slug:a", 1, 60_000);
    setInCache("cms:oracion:list:*:p1:l20", 2, 60_000);
    setInCache("cms:santopedia:slug:b", 3, 60_000);

    const removed = invalidateContentType("oracion");

    expect(removed).toBe(2);
    expect(getFromCache("cms:oracion:slug:a")).toBeNull();
    expect(getFromCache("cms:oracion:list:*:p1:l20")).toBeNull();
    expect(getFromCache("cms:santopedia:slug:b")).toBe(3);
  });

  it("cacheKeyFor distingue slug de listado con term y paginacion", () => {
    expect(cacheKeyFor("oracion", { slug: "padre-nuestro" })).toBe(
      "cms:oracion:slug:padre-nuestro",
    );
    expect(
      cacheKeyFor("oracion", { term: "adviento", page: 2, limit: 20 }),
    ).toBe("cms:oracion:list:adviento:p2:l20");
    expect(cacheKeyFor("oracion", {})).toBe("cms:oracion:list:*:p1:l20");
  });

  it("defaultCacheTtlMs lee CMS_CACHE_TTL_SECONDS con clamp", () => {
    vi.stubEnv("CMS_CACHE_TTL_SECONDS", "30");
    expect(defaultCacheTtlMs()).toBe(30_000);

    vi.stubEnv("CMS_CACHE_TTL_SECONDS", "9999");
    expect(defaultCacheTtlMs()).toBe(CACHE_TTL_MAX_MS);

    vi.stubEnv("CMS_CACHE_TTL_SECONDS", "basura");
    expect(defaultCacheTtlMs()).toBe(CACHE_TTL_MAX_MS);
  });
});

describe("API key (SEC-CMS-006)", () => {
  it("extractApiKey lee el header Bearer", () => {
    const request = new Request("http://localhost", {
      headers: { authorization: "Bearer clave-123" },
    });
    expect(extractApiKey(request)).toBe("clave-123");
  });

  it("extractApiKey devuelve null sin header o sin Bearer", () => {
    expect(extractApiKey(new Request("http://localhost"))).toBeNull();
    expect(
      extractApiKey(
        new Request("http://localhost", {
          headers: { authorization: "Basic abc" },
        }),
      ),
    ).toBeNull();
  });

  it("hashApiKey es determinista (SHA-256) y no expone la key", () => {
    const hash = hashApiKey("clave-123");
    expect(hash).toBe(hashApiKey("clave-123"));
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain("clave");
  });
});
