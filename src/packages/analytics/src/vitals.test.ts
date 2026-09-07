import { afterEach, describe, expect, it, vi } from "vitest";
import { installVitalsCapture, rateVital } from "./vitals.js";

type ObserverSpec = {
  type: string;
  callback: (entries: PerformanceEntry[]) => void;
};

class FakePerformanceObserver {
  static instances: FakePerformanceObserver[] = [];
  static specs: ObserverSpec[] = [];

  disconnected = false;

  constructor(
    callback: (list: { getEntries: () => PerformanceEntry[] }) => void,
  ) {
    FakePerformanceObserver.instances.push(this);
    this.pushCallback = callback;
  }

  pushCallback: (list: { getEntries: () => PerformanceEntry[] }) => void;

  observe(init: PerformanceObserverInit) {
    const type = String(init.type);
    FakePerformanceObserver.specs.push({
      type,
      callback: (entries) => this.pushCallback({ getEntries: () => entries }),
    });
  }

  disconnect() {
    this.disconnected = true;
  }
}

function fakeEntry(
  partial: Partial<PerformanceEntry> & { startTime?: number },
): PerformanceEntry {
  return {
    name: "fake",
    entryType: "fake",
    startTime: 0,
    duration: 0,
    ...partial,
  } as PerformanceEntry;
}

function install() {
  const sent: Array<{
    metric_name: string;
    metric_value: number;
    rating: string;
  }> = [];
  const flush = installVitalsCapture({
    send: (vital) => sent.push({ ...vital }),
  });
  return { sent, flush };
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakePerformanceObserver.instances = [];
  FakePerformanceObserver.specs = [];
});

describe("rateVital (umbrales estandar)", () => {
  it("LCP: good < 2500, ni < 4000, poor >= 4000", () => {
    expect(rateVital("LCP", 2400)).toBe("good");
    expect(rateVital("LCP", 3000)).toBe("needs-improvement");
    expect(rateVital("LCP", 4200)).toBe("poor");
  });

  it("INP: good < 200, ni < 500, poor >= 500", () => {
    expect(rateVital("INP", 150)).toBe("good");
    expect(rateVital("INP", 350)).toBe("needs-improvement");
    expect(rateVital("INP", 600)).toBe("poor");
  });

  it("CLS: good < 0.1, ni < 0.25, poor >= 0.25", () => {
    expect(rateVital("CLS", 0.05)).toBe("good");
    expect(rateVital("CLS", 0.2)).toBe("needs-improvement");
    expect(rateVital("CLS", 0.4)).toBe("poor");
  });
});

describe("installVitalsCapture (TC-LOG-RUM-003)", () => {
  it("sin PerformanceObserver no hace nada y devuelve flush no-op", () => {
    vi.stubGlobal("PerformanceObserver", undefined);
    const { sent, flush } = install();
    expect(() => flush()).not.toThrow();
    expect(sent).toEqual([]);
  });

  it("registra observers para LCP, layout-shift y event", () => {
    vi.stubGlobal("PerformanceObserver", FakePerformanceObserver);
    install();
    const types = FakePerformanceObserver.specs.map((spec) => spec.type);
    expect(types).toContain("largest-contentful-paint");
    expect(types).toContain("layout-shift");
    expect(types).toContain("event");
  });

  it("envia LCP/INP/CLS al flush con rating correcto", () => {
    vi.stubGlobal("PerformanceObserver", FakePerformanceObserver);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      visibilityState: "visible",
    });

    const { sent, flush } = install();

    const lcpSpec = FakePerformanceObserver.specs.find(
      (spec) => spec.type === "largest-contentful-paint",
    );
    const clsSpec = FakePerformanceObserver.specs.find(
      (spec) => spec.type === "layout-shift",
    );
    const eventSpec = FakePerformanceObserver.specs.find(
      (spec) => spec.type === "event",
    );

    lcpSpec?.callback([fakeEntry({ startTime: 1840 })]);
    clsSpec?.callback([
      { hadRecentInput: false, value: 0.08 } as unknown as PerformanceEntry,
    ]);
    clsSpec?.callback([
      { hadRecentInput: true, value: 0.5 } as unknown as PerformanceEntry,
    ]);
    eventSpec?.callback([
      {
        duration: 180,
        interactionId: 1,
      } as unknown as PerformanceEntry,
    ]);

    flush();

    expect(sent).toEqual([
      { metric_name: "LCP", metric_value: 1840, rating: "good" },
      { metric_name: "INP", metric_value: 180, rating: "good" },
      { metric_name: "CLS", metric_value: 0.08, rating: "good" },
    ]);
  });

  it("el flush es idempotente y desconecta los observers", () => {
    vi.stubGlobal("PerformanceObserver", FakePerformanceObserver);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      visibilityState: "visible",
    });

    const { sent, flush } = install();

    const lcpSpec = FakePerformanceObserver.specs.find(
      (spec) => spec.type === "largest-contentful-paint",
    );
    lcpSpec?.callback([fakeEntry({ startTime: 5000 })]);

    flush();
    flush();

    expect(sent).toEqual([
      { metric_name: "LCP", metric_value: 5000, rating: "poor" },
    ]);
    expect(
      FakePerformanceObserver.instances.every(
        (instance) => instance.disconnected,
      ),
    ).toBe(true);
  });

  it("ignora shifts con hadRecentInput=true (no cuentan para CLS)", () => {
    vi.stubGlobal("PerformanceObserver", FakePerformanceObserver);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      visibilityState: "visible",
    });

    const { sent, flush } = install();

    const clsSpec = FakePerformanceObserver.specs.find(
      (spec) => spec.type === "layout-shift",
    );
    clsSpec?.callback([
      { hadRecentInput: true, value: 0.9 } as unknown as PerformanceEntry,
    ]);

    flush();
    expect(sent).toEqual([]);
  });
});
