/**
 * Envio de telemetria via navigator.sendBeacon con fallback a fetch
 * keepalive (ADR-LOG-RUM-002). Nunca lanza: ante cualquier fallo devuelve
 * false y la app anfitriona sigue funcionando (RB-LOG-RUM-006).
 */
export function sendBeaconJson(
  apiUrl: string,
  path: string,
  payload: unknown,
): boolean {
  try {
    const url = `${apiUrl.replace(/\/$/, "")}${path}`;
    const body = JSON.stringify(payload);

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon(url, blob);
      if (queued) {
        return true;
      }
      // Cola llena: cae al fallback de fetch para no perder el evento.
    }

    if (typeof fetch === "function") {
      void fetch(url, {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body,
      }).catch(() => {
        // Fallo de red: se descarta silenciosamente (NFR-LOG-RUM-001).
      });
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
