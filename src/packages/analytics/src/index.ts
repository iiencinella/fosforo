/**
 * SDK de RUM del ecosistema Fosforo (@repo/analytics).
 *
 * Contratos: FR-LOG-RUM-001..008, ADR-LOG-RUM-001/002/004/006/008/009,
 * RB-LOG-RUM-001..007. Telemetria anonima: sin user id, sin IP, sin PII.
 * El servidor (app log) es autoridad final de taxonomia, anti-PII y
 * sampling de defaults (RB-LOG-RUM-003); el sampling aqui configurado es
 * un filtro adicional del lado cliente (default: sin filtro adicional).
 *
 * El SDK NUNCA lanza errores hacia la app anfitriona (RB-LOG-RUM-006):
 * toda la API publica esta envuelta en try-catch con fallback silencioso,
 * y es seguro importar/inicializar en SSR (hace no-ops sin window).
 */
import { sendBeaconJson } from "./beacon.js";
import { readConsent, respectDNT, writeConsent } from "./consent.js";
import { installErrorListeners } from "./errors.js";
import { getSessionId } from "./session.js";
import { installVitalsCapture, type CapturedVital } from "./vitals.js";

export { sendBeaconJson } from "./beacon.js";
export { generateSessionId, getSessionId } from "./session.js";
export { readConsent, respectDNT, writeConsent } from "./consent.js";
export { installErrorListeners } from "./errors.js";
export { installVitalsCapture, rateVital } from "./vitals.js";
export type { CapturedVital, VitalMetric, VitalRating } from "./vitals.js";
export type { FrontendErrorInfo } from "./errors.js";

export type SamplingConfig = {
  pageview?: number;
  custom?: number;
  error?: number;
};

export type AnalyticsConfig = {
  /** Nombre de la app anfitriona (debe estar en la taxonomia del servidor). */
  appName: string;
  /** URL base de la app log (ej: https://log.fosforo.app). */
  apiUrl: string;
  /** Version de la app anfitriona (opcional, se reporta con cada evento). */
  appVersion?: string;
  /**
   * Sampling del lado cliente (default sin filtro adicional: 1/1/1).
   * El default 100% pageview/errores y 10% custom vive en el servidor
   * (rum_sampling_config).
   */
  samplingConfig?: SamplingConfig;
  /** Loguea en consola decisiones del SDK (solo desarrollo). */
  debug?: boolean;
};

type ResolvedSampling = { pageview: number; custom: number; error: number };

type AnalyticsState = {
  appName: string;
  apiUrl: string;
  appVersion: string | null;
  sampling: ResolvedSampling;
  debug: boolean;
  dnt: boolean;
  consent: boolean;
};

let state: AnalyticsState | null = null;
let errorCleanup: (() => void) | null = null;
let vitalsFlush: (() => void) | null = null;

function clampSampling(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, value));
}

function currentPage(): { path: string | null; url: string | null } {
  try {
    if (typeof location === "undefined") {
      return { path: null, url: null };
    }
    return {
      path: location.pathname ?? null,
      url: location.href ?? null,
    };
  } catch {
    return { path: null, url: null };
  }
}

/** true solo con consentimiento explicito y sin DNT activo. */
export function isTrackingActive(): boolean {
  return state !== null && !state.dnt && state.consent;
}

/**
 * true si el usuario concedio consentimiento explicito (independiente de
 * DNT; DNT ademas desactiva el envio).
 */
export function hasConsent(): boolean {
  return readConsent() === true;
}

/**
 * true si el navegador tiene Do Not Track activo: el SDK no envia nada y
 * no muestra el banner de consentimiento.
 */
export function respectDNTStatus(): boolean {
  return respectDNT();
}

/**
 * Registra la decision de consentimiento del usuario. Con false el SDK
 * deja de enviar telemetria inmediatamente.
 */
export function setConsent(granted: boolean): void {
  try {
    writeConsent(granted);
    if (state) {
      state.consent = granted;
    }
    if (state?.debug) {
      console.info(`[rum] consentimiento: ${granted ? "granted" : "denied"}`);
    }
  } catch {
    // nunca lanza
  }
}

function sendEvent(
  eventName: string,
  metadata?: Record<string, unknown>,
): void {
  if (!state) {
    return;
  }
  const page = currentPage();
  sendBeaconJson(state.apiUrl, "/api/rum", {
    app: state.appName,
    event_name: eventName,
    page_path: page.path ?? undefined,
    page_url: page.url ?? undefined,
    session_id_anon: getSessionId(),
    metadata:
      metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    app_version: state.appVersion ?? undefined,
    has_consent: true,
  });
}

function sendVital(vital: CapturedVital): void {
  if (!state) {
    return;
  }
  const page = currentPage();
  sendBeaconJson(state.apiUrl, "/api/rum/vitals", {
    app: state.appName,
    page_path: page.path ?? undefined,
    page_url: page.url ?? undefined,
    metric_name: vital.metric_name,
    metric_value: vital.metric_value,
    rating: vital.rating,
    session_id_anon: getSessionId(),
    app_version: state.appVersion ?? undefined,
  });
}

function sendError(info: {
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
}): void {
  sendEvent("frontend.error", info);
}

/**
 * Inicializa el SDK. Idempotente: una segunda llamada reemplaza la config
 * y reinstala los listeners (sin duplicarlos).
 */
export function init(config: AnalyticsConfig): void {
  try {
    if (errorCleanup) {
      errorCleanup();
      errorCleanup = null;
    }
    vitalsFlush = null;

    if (!config || typeof config.appName !== "string" || !config.appName) {
      return;
    }

    state = {
      appName: config.appName,
      apiUrl: config.apiUrl,
      appVersion: config.appVersion ?? null,
      sampling: {
        pageview: clampSampling(config.samplingConfig?.pageview, 1),
        custom: clampSampling(config.samplingConfig?.custom, 1),
        error: clampSampling(config.samplingConfig?.error, 1),
      },
      debug: config.debug === true,
      dnt: respectDNT(),
      consent: readConsent() === true,
    };

    if (state.debug) {
      console.info(
        `[rum] init ${state.appName} (dnt=${state.dnt}, consent=${state.consent})`,
      );
    }

    if (!isTrackingActive()) {
      return;
    }

    errorCleanup = installErrorListeners(sendError);
    sendEvent("pageview");
  } catch {
    // nunca lanza
  }
}

function samplingAllowsClient(eventName: string): boolean {
  if (!state) {
    return false;
  }
  const threshold =
    eventName === "pageview"
      ? state.sampling.pageview
      : eventName === "frontend.error"
        ? state.sampling.error
        : state.sampling.custom;
  return Math.random() < threshold;
}

/**
 * Reporta un evento de producto custom (ej: misal.lectio.started).
 * La taxonomia la valida el servidor; ante rechazo el evento se pierde
 * silenciosamente (fire-and-forget).
 */
export function track(
  eventName: string,
  metadata?: Record<string, unknown>,
): void {
  try {
    if (!isTrackingActive() || !samplingAllowsClient(eventName)) {
      return;
    }
    sendEvent(eventName, metadata);
  } catch {
    // nunca lanza
  }
}

/**
 * Instala la captura automatica de Web Vitals (LCP/INP/CLS) que se envia
 * al ocultar la pagina. Llamar una vez por app.
 */
export function captureVitals(): void {
  try {
    if (!state || vitalsFlush) {
      return;
    }
    vitalsFlush = installVitalsCapture({ send: sendVital });
  } catch {
    // nunca lanza
  }
}
