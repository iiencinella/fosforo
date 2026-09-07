/**
 * Consentimiento y Do Not Track (SEC-LOG-RUM-002, RB-LOG-RUM-005).
 * El estado vive en localStorage por dominio; DNT se consulta por sesion.
 */
const CONSENT_STORAGE_KEY = "fosforo_rum_consent";

export function respectDNT(): boolean {
  try {
    if (typeof navigator === "undefined") {
      return false;
    }
    const dnt =
      navigator.doNotTrack ??
      (globalThis as { doNotTrack?: string }).doNotTrack;
    return dnt === "1" || dnt === "yes";
  } catch {
    return false;
  }
}

/** true = concedido, false = rechazado, null = sin decision. */
export function readConsent(): boolean | null {
  try {
    if (typeof localStorage === "undefined") {
      return null;
    }
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "granted") return true;
    if (value === "denied") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeConsent(granted: boolean): void {
  try {
    if (typeof localStorage === "undefined") {
      return;
    }
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "granted" : "denied");
  } catch {
    // storage bloqueado: el consentimiento vive solo en memoria (ver index)
  }
}
