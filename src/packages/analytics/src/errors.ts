/**
 * Captura global de errores de frontend (FR-LOG-RUM-004). Cada error se
 * reporta como evento frontend.error con contexto de navegador; el stack
 * se trunca para respetar el limite de metadata.
 */

export type FrontendErrorInfo = {
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
};

const MAX_STACK_LENGTH = 2000;

export function installErrorListeners(
  onError: (info: FrontendErrorInfo) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const errorHandler = (event: ErrorEvent) => {
    try {
      const stack =
        event.error instanceof Error ? event.error.stack : undefined;
      onError({
        message: event.message || "Error desconocido",
        stack: stack ? stack.slice(0, MAX_STACK_LENGTH) : undefined,
        source: event.filename || undefined,
        lineno: event.lineno ?? undefined,
        colno: event.colno ?? undefined,
      });
    } catch {
      // ignorar
    }
  };

  const rejectionHandler = (event: PromiseRejectionEvent) => {
    try {
      const reason: unknown = event.reason;
      onError({
        message:
          reason instanceof Error
            ? reason.message
            : String(reason ?? "Rechazo sin motivo"),
        stack:
          reason instanceof Error && reason.stack
            ? reason.stack.slice(0, MAX_STACK_LENGTH)
            : undefined,
      });
    } catch {
      // ignorar
    }
  };

  try {
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
  } catch {
    return () => {};
  }

  return () => {
    try {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    } catch {
      // ignorar
    }
  };
}
