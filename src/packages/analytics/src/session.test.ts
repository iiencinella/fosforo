import { afterEach, describe, expect, it, vi } from "vitest";
import { generateSessionId, getSessionId } from "./session.js";

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

describe("sesion anonima (TC-LOG-RUM-004, RB-LOG-RUM-007)", () => {
  it("genera un id hex de 32 caracteres", () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it("persiste el id dentro de la misma sesion de navegador", () => {
    vi.stubGlobal("sessionStorage", storage());
    const first = getSessionId();
    const second = getSessionId();
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{32}$/);
  });

  it("regenera el id si el valor persistido es invalido", () => {
    const s = storage();
    s.setItem("fosforo_rum_session_id", "no-es-hex");
    vi.stubGlobal("sessionStorage", s);
    const id = getSessionId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(id).not.toBe("no-es-hex");
  });

  it("sin sessionStorage disponible devuelve un id efimero sin lanzar", () => {
    vi.stubGlobal("sessionStorage", undefined);
    const id = getSessionId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it("con storage bloqueado devuelve un id efimero sin lanzar", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    const id = getSessionId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });
});
