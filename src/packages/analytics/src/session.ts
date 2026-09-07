/**
 * Sesion anonima (RB-LOG-RUM-007, ADR-LOG-RUM-004): id hex aleatorio de 32
 * caracteres por sesion de navegador. Se persiste solo en sessionStorage
 * (muere con la pestana/sesion); nunca entre sesiones ni entre apps.
 */
const SESSION_STORAGE_KEY = "fosforo_rum_session_id";

export function generateSessionId(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID().replace(/-/g, "");
    }
  } catch {
    // contextos no seguros: fallback determinista abajo
  }

  let id = "";
  for (let i = 0; i < 32; i += 1) {
    id += Math.floor(Math.random() * 16).toString(16);
  }
  return id;
}

export function getSessionId(): string {
  try {
    if (typeof sessionStorage === "undefined") {
      return generateSessionId();
    }

    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && /^[0-9a-f]{16,64}$/i.test(existing)) {
      return existing;
    }

    const id = generateSessionId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    // storage bloqueado (privacy mode): id efimero sin persistencia
    return generateSessionId();
  }
}
