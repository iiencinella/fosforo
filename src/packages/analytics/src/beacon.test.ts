import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendBeaconJson } from "./beacon.js";

type SendBeacon = (url: string, data: unknown) => boolean;

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendBeaconJson (TC-LOG-RUM-009)", () => {
  it("usa navigator.sendBeacon cuando esta disponible", () => {
    const sendBeacon = vi.fn(() => true) as unknown as SendBeacon;
    vi.stubGlobal("navigator", { sendBeacon });

    const result = sendBeaconJson("https://log.app", "/api/rum", {
      app: "misal",
    });

    expect(result).toBe(true);
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, data] = (sendBeacon as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown as [string, Blob];
    expect(url).toBe("https://log.app/api/rum");
    expect(data).toBeInstanceOf(Blob);
    expect(data.type).toBe("application/json");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normaliza la url base sin slash final", () => {
    const sendBeacon = vi.fn(() => true) as unknown as SendBeacon;
    vi.stubGlobal("navigator", { sendBeacon });

    sendBeaconJson("https://log.app/", "/api/rum", { app: "misal" });

    const [url] = (sendBeacon as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0] as unknown as [string];
    expect(url).toBe("https://log.app/api/rum");
  });

  it("cae a fetch keepalive cuando sendBeacon no existe", () => {
    vi.stubGlobal("navigator", {});

    const result = sendBeaconJson("https://log.app", "/api/rum/vitals", {
      metric_name: "LCP",
    });

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      { method: string; keepalive: boolean },
    ];
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
  });

  it("devuelve false cuando no hay sendBeacon ni fetch", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("fetch", undefined);

    const result = sendBeaconJson("https://log.app", "/api/rum", {});

    expect(result).toBe(false);
  });

  it("no propaga excepciones de la app anfitriona (TC-LOG-RUM-008)", () => {
    vi.stubGlobal("navigator", {
      sendBeacon: () => {
        throw new Error("boom");
      },
    });

    expect(() =>
      sendBeaconJson("https://log.app", "/api/rum", {}),
    ).not.toThrow();
    expect(sendBeaconJson("https://log.app", "/api/rum", {})).toBe(false);
  });

  it("si sendBeacon devuelve false (cola llena) cae a fetch para no perder el evento", () => {
    const sendBeacon = vi.fn(() => false) as unknown as SendBeacon;
    vi.stubGlobal("navigator", { sendBeacon });

    const result = sendBeaconJson("https://log.app", "/api/rum", {});

    expect(result).toBe(true);
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
