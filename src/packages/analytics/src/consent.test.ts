import { afterEach, describe, expect, it, vi } from "vitest";
import { readConsent, respectDNT, writeConsent } from "./consent.js";

const storage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("consentimiento y DNT (TC-LOG-RUM-006/007)", () => {
  it("sin decision previa devuelve null", () => {
    vi.stubGlobal("localStorage", storage());
    expect(readConsent()).toBeNull();
  });

  it("persiste y lee granted/denied", () => {
    const s = storage();
    vi.stubGlobal("localStorage", s);

    writeConsent(true);
    expect(readConsent()).toBe(true);

    writeConsent(false);
    expect(readConsent()).toBe(false);
  });

  it("con storage bloqueado no lanza y devuelve null", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });

    expect(() => writeConsent(true)).not.toThrow();
    expect(readConsent()).toBeNull();
  });

  it("respectDNT detecta navigator.doNotTrack=1", () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    expect(respectDNT()).toBe(true);
  });

  it("respectDNT detecta window.doNotTrack=yes (legacy)", () => {
    vi.stubGlobal("navigator", { doNotTrack: null });
    const globalWithLegacy = globalThis as { doNotTrack?: string };
    globalWithLegacy.doNotTrack = "yes";
    try {
      expect(respectDNT()).toBe(true);
    } finally {
      delete globalWithLegacy.doNotTrack;
    }
  });

  it("respectDNT con DNT desactivado devuelve false", () => {
    vi.stubGlobal("navigator", { doNotTrack: "0" });
    expect(respectDNT()).toBe(false);
  });

  it("respectDNT sin navigator (SSR) devuelve false", () => {
    vi.stubGlobal("navigator", undefined);
    expect(respectDNT()).toBe(false);
  });
});
