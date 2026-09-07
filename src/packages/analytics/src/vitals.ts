/**
 * Captura de Web Vitals LCP/INP/CLS (FR-LOG-RUM-003, RB-LOG-RUM-002).
 * Los valores se acumulan y se envian al ocultar la pagina (pagehide o
 * visibilitychange a hidden). Si PerformanceObserver no existe (SSR o
 * navegador viejo) no hace nada y nunca lanza.
 */

export type VitalMetric = "LCP" | "INP" | "CLS";

export type VitalRating = "good" | "needs-improvement" | "poor";

export type CapturedVital = {
  metric_name: VitalMetric;
  metric_value: number;
  rating: VitalRating;
};

export function rateVital(metric: VitalMetric, value: number): VitalRating {
  if (metric === "LCP") {
    return value < 2500 ? "good" : value < 4000 ? "needs-improvement" : "poor";
  }
  if (metric === "INP") {
    return value < 200 ? "good" : value < 500 ? "needs-improvement" : "poor";
  }
  return value < 0.1 ? "good" : value < 0.25 ? "needs-improvement" : "poor";
}

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  value: number;
};

type EventTimingEntry = PerformanceEntry & {
  duration: number;
  interactionId: number;
};

export type InstallVitalsOptions = {
  send: (vital: CapturedVital) => void;
};

/**
 * Instala los observers y devuelve la funcion de flush (idempotente), util
 * para tests y para enviar manualmente.
 */
export function installVitalsCapture(
  options: InstallVitalsOptions,
): () => void {
  if (typeof PerformanceObserver === "undefined") {
    return () => {};
  }

  let lcpValue: number | null = null;
  let clsValue = 0;
  let inpValue: number | null = null;
  let flushed = false;

  const observers: PerformanceObserver[] = [];

  const safeObserve = (
    type: string,
    callback: (entries: PerformanceEntry[]) => void,
    extraOptions: Record<string, unknown> = {},
  ) => {
    try {
      const observer = new PerformanceObserver((list) => {
        try {
          callback(list.getEntries());
        } catch {
          // un fallo de procesamiento no rompe la pagina
        }
      });
      observer.observe({
        type,
        buffered: true,
        ...extraOptions,
      } as PerformanceObserverInit);
      observers.push(observer);
    } catch {
      // tipo de entrada no soportado por el navegador: se ignora
    }
  };

  safeObserve("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) {
      lcpValue = last.startTime;
    }
  });

  safeObserve("layout-shift", (entries) => {
    for (const entry of entries) {
      const shift = entry as LayoutShiftEntry;
      if (!shift.hadRecentInput) {
        clsValue += shift.value;
      }
    }
  });

  safeObserve(
    "event",
    (entries) => {
      for (const entry of entries) {
        const timing = entry as EventTimingEntry;
        if (timing.interactionId && timing.duration > (inpValue ?? -1)) {
          inpValue = timing.duration;
        }
      }
    },
    { durationThreshold: 16 },
  );

  const flush = () => {
    if (flushed) {
      return;
    }
    flushed = true;
    try {
      if (lcpValue !== null) {
        options.send({
          metric_name: "LCP",
          metric_value: lcpValue,
          rating: rateVital("LCP", lcpValue),
        });
      }
      if (inpValue !== null) {
        options.send({
          metric_name: "INP",
          metric_value: inpValue,
          rating: rateVital("INP", inpValue),
        });
      }
      if (clsValue > 0) {
        options.send({
          metric_name: "CLS",
          metric_value: clsValue,
          rating: rateVital("CLS", clsValue),
        });
      }
    } catch {
      // el envio nunca rompe la pagina
    }
    for (const observer of observers) {
      try {
        observer.disconnect();
      } catch {
        // ignorar
      }
    }
  };

  try {
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", flush);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        try {
          if (document.visibilityState === "hidden") {
            flush();
          }
        } catch {
          // ignorar
        }
      });
    }
  } catch {
    // ignorar
  }

  return flush;
}
