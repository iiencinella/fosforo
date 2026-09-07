import { afterEach, describe, expect, it, vi } from "vitest";
import { installErrorListeners } from "./errors.js";

type ListenerRecord = {
  type: string;
  handler: (event: unknown) => void;
};

function fakeWindow() {
  const listeners: ListenerRecord[] = [];
  return {
    listeners,
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      listeners.push({ type, handler });
    },
    removeEventListener: (type: string, handler: (event: unknown) => void) => {
      const index = listeners.findIndex(
        (item) => item.type === type && item.handler === handler,
      );
      if (index >= 0) listeners.splice(index, 1);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("captura de errores de frontend (TC-LOG-RUM-010)", () => {
  it("sin window (SSR) no instala nada", () => {
    vi.stubGlobal("window", undefined);
    const cleanup = installErrorListeners(() => {});
    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("instala listeners de error y unhandledrejection", () => {
    const fake = fakeWindow();
    vi.stubGlobal("window", fake);

    installErrorListeners(() => {});

    expect(fake.listeners.map((item) => item.type)).toEqual([
      "error",
      "unhandledrejection",
    ]);
  });

  it("reporta un error con contexto completo", () => {
    const fake = fakeWindow();
    vi.stubGlobal("window", fake);

    const reported: unknown[] = [];
    installErrorListeners((info) => reported.push(info));

    const errorEvent = {
      message: "TypeError: x is not a function",
      error: new Error("x is not a function"),
      filename: "/src/app.ts",
      lineno: 12,
      colno: 5,
    };
    fake.listeners[0]?.handler(errorEvent);

    expect(reported).toEqual([
      {
        message: "TypeError: x is not a function",
        stack: expect.stringContaining("x is not a function"),
        source: "/src/app.ts",
        lineno: 12,
        colno: 5,
      },
    ]);
  });

  it("reporta unhandledrejection con el motivo", () => {
    const fake = fakeWindow();
    vi.stubGlobal("window", fake);

    const reported: unknown[] = [];
    installErrorListeners((info) => reported.push(info));

    fake.listeners[1]?.handler({
      reason: new Error("promise rota"),
    });

    expect(reported).toEqual([
      {
        message: "promise rota",
        stack: expect.stringContaining("promise rota"),
      },
    ]);
  });

  it("trunca stacks largos a 2000 caracteres", () => {
    const fake = fakeWindow();
    vi.stubGlobal("window", fake);

    const longError = new Error("boom");
    longError.stack = "x".repeat(5000);
    const reported: Array<{ stack?: string }> = [];
    installErrorListeners((info) => reported.push(info as { stack?: string }));

    fake.listeners[0]?.handler({
      message: "boom",
      error: longError,
    });

    expect(reported[0]?.stack?.length).toBe(2000);
  });

  it("el handler no lanza si onError falla", () => {
    const fake = fakeWindow();
    vi.stubGlobal("window", fake);

    installErrorListeners(() => {
      throw new Error("fallo interno");
    });

    expect(() =>
      fake.listeners[0]?.handler({ message: "algo roto", error: null }),
    ).not.toThrow();
  });

  it("cleanup remueve los listeners instalados", () => {
    const fake = fakeWindow();
    vi.stubGlobal("window", fake);

    const cleanup = installErrorListeners(() => {});
    expect(fake.listeners.length).toBe(2);

    cleanup();
    expect(fake.listeners.length).toBe(0);
  });
});
