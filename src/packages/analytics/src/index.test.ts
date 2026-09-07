import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureVitals,
  hasConsent,
  init,
  isTrackingActive,
  setConsent,
  track,
} from "./index.js";

const sentBeacons: Array<{ url: string; body: Record<string, unknown> }> = [];
const windowListeners: Array<{
  type: string;
  handler: (event: unknown) => void;
}> = [];

function storageMap() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

function stubBrowser(options: { dnt?: string; consent?: boolean } = {}) {
  sentBeacons.length = 0;
  windowListeners.length = 0;

  const localStorage = storageMap();
  if (options.consent !== undefined) {
    localStorage.setItem(
      "fosforo_rum_consent",
      options.consent ? "granted" : "denied",
    );
  }

  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("sessionStorage", storageMap());
  vi.stubGlobal("navigator", {
    doNotTrack: options.dnt ?? null,
    sendBeacon: () => true,
  });
  vi.stubGlobal("window", {
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      windowListeners.push({ type, handler });
    },
    removeEventListener: (type: string, handler: (event: unknown) => void) => {
      const index = windowListeners.findIndex(
        (item) => item.type === type && item.handler === handler,
      );
      if (index >= 0) {
        windowListeners.splice(index, 1);
      }
    },
  });
  vi.stubGlobal("location", {
    pathname: "/dia/2026-09-06",
    href: "https://misal.app/dia/2026-09-06",
  });
}

/**
 * Blob con lectura sincronica del body + navigator que lo decodifica, para
 * los tests que inspeccionan el payload enviado.
 */
function stubSyncBeacon() {
  vi.stubGlobal(
    "Blob",
    class FakeBlob {
      type: string;
      private _text: string;
      constructor(parts: BlobPart[]) {
        this.type = "application/json";
        this._text = String(parts[0] ?? "");
      }
      text() {
        return this._text;
      }
    },
  );
  vi.stubGlobal("navigator", {
    doNotTrack: null,
    sendBeacon: (url: string, data: unknown) => {
      const blob = data as { text: () => string };
      sentBeacons.push({ url, body: JSON.parse(blob.text()) });
      return true;
    },
  });
}

beforeEach(() => {
  vi.stubGlobal("navigator", {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("init y pageview automatico", () => {
  it("con consentimiento y sin DNT: init instala errores y envia pageview", () => {
    stubBrowser({ consent: true });
    stubSyncBeacon();

    init({ appName: "misal", apiUrl: "https://log.app" });

    expect(isTrackingActive()).toBe(true);
    expect(windowListeners.map((item) => item.type)).toEqual([
      "error",
      "unhandledrejection",
    ]);
    const pageview = sentBeacons.find(
      (item) => item.body.event_name === "pageview",
    );
    expect(pageview).toBeDefined();
    expect(pageview?.body.app).toBe("misal");
    expect(pageview?.body.page_path).toBe("/dia/2026-09-06");
    expect(pageview?.url).toBe("https://log.app/api/rum");
    expect(String(pageview?.body.session_id_anon)).toMatch(/^[0-9a-f]{32}$/);
  });

  it("sin consentimiento no envia nada", () => {
    stubBrowser({ consent: false });

    init({ appName: "misal", apiUrl: "https://log.app" });

    expect(isTrackingActive()).toBe(false);
    expect(sentBeacons).toEqual([]);
    expect(windowListeners).toEqual([]);
  });

  it("con DNT activo no envia nada (TC-LOG-RUM-006)", () => {
    stubBrowser({ dnt: "1", consent: true });

    init({ appName: "misal", apiUrl: "https://log.app" });

    expect(isTrackingActive()).toBe(false);
    expect(sentBeacons).toEqual([]);
  });

  it("sin navigator ni window (SSR) hace no-op sin lanzar", () => {
    vi.stubGlobal("navigator", undefined);
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("location", undefined);

    expect(() =>
      init({ appName: "misal", apiUrl: "https://log.app" }),
    ).not.toThrow();
  });

  it("init con config invalida no lanza", () => {
    expect(() =>
      init(null as unknown as Parameters<typeof init>[0]),
    ).not.toThrow();
    expect(() => init({ appName: "", apiUrl: "" })).not.toThrow();
  });

  it("segunda init reinstala listeners sin duplicarlos", () => {
    stubBrowser({ consent: true });

    init({ appName: "misal", apiUrl: "https://log.app" });
    const firstCount = windowListeners.length;
    init({ appName: "misal", apiUrl: "https://log.app" });

    expect(windowListeners.length).toBe(firstCount);
  });
});

describe("track (TC-LOG-RUM-002)", () => {
  function activeSdk(sampling = { pageview: 1, custom: 1, error: 1 }) {
    stubBrowser({ consent: true });
    stubSyncBeacon();
    init({
      appName: "misal",
      apiUrl: "https://log.app",
      samplingConfig: sampling,
    });
    sentBeacons.length = 0;
  }

  it("envia un evento custom con metadata", () => {
    activeSdk();

    track("misal.lectio.started", { lectura: "mc 5,1-12" });

    const event = sentBeacons.find(
      (item) => item.body.event_name === "misal.lectio.started",
    );
    expect(event).toBeDefined();
    expect(event?.body.metadata).toEqual({ lectura: "mc 5,1-12" });
    expect(event?.body.has_consent).toBe(true);
  });

  it("sin consentimiento track es no-op", () => {
    stubBrowser({ consent: false });
    init({ appName: "misal", apiUrl: "https://log.app" });
    sentBeacons.length = 0;

    track("misal.lectio.started");

    expect(sentBeacons).toEqual([]);
  });

  it("con sampling custom=0 no envia eventos custom (TC-LOG-RUM-005)", () => {
    activeSdk({ pageview: 1, custom: 0, error: 1 });

    track("misal.lectio.started");

    expect(sentBeacons).toEqual([]);
  });

  it("con sampling error=0 no envia frontend.error", () => {
    activeSdk({ pageview: 1, custom: 1, error: 0 });

    track("frontend.error", { message: "boom" });

    expect(sentBeacons).toEqual([]);
  });

  it("track nunca lanza aunque el envio falle (TC-LOG-RUM-008)", () => {
    stubBrowser({ consent: true });
    vi.stubGlobal("navigator", {
      doNotTrack: null,
      sendBeacon: () => {
        throw new Error("boom");
      },
    });
    init({ appName: "misal", apiUrl: "https://log.app" });

    expect(() => track("misal.lectio.started", {})).not.toThrow();
  });
});

describe("consentimiento dinamico", () => {
  it("setConsent(true) activa el envio de eventos posteriores", () => {
    stubBrowser({ consent: false });
    init({ appName: "misal", apiUrl: "https://log.app" });
    expect(hasConsent()).toBe(false);

    setConsent(true);

    expect(hasConsent()).toBe(true);
    expect(isTrackingActive()).toBe(true);
  });

  it("setConsent(false) detiene el envio de inmediato", () => {
    stubBrowser({ consent: true });
    init({ appName: "misal", apiUrl: "https://log.app" });

    setConsent(false);
    sentBeacons.length = 0;

    track("misal.lectio.started");
    expect(sentBeacons).toEqual([]);
  });
});

describe("errores de frontend", () => {
  it("un error global dispara un evento frontend.error (TC-LOG-RUM-010)", () => {
    stubBrowser({ consent: true });
    stubSyncBeacon();

    init({ appName: "misal", apiUrl: "https://log.app" });

    const errorHandler = windowListeners.find(
      (item) => item.type === "error",
    )?.handler;
    errorHandler?.({
      message: "TypeError: x is not a function",
      error: new Error("x is not a function"),
    });

    const errorEvent = sentBeacons.find(
      (item) => item.body.event_name === "frontend.error",
    );
    expect(errorEvent).toBeDefined();
    expect((errorEvent?.body.metadata as { message: string }).message).toBe(
      "TypeError: x is not a function",
    );
  });
});

describe("captureVitals", () => {
  it("sin PerformanceObserver no hace nada y no lanza", () => {
    stubBrowser({ consent: true });
    vi.stubGlobal("PerformanceObserver", undefined);

    init({ appName: "misal", apiUrl: "https://log.app" });
    expect(() => captureVitals()).not.toThrow();
  });
});
