export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type LogPayload = {
  app: string;
  level: LogLevel;
  message: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
  stack_trace?: string;
  app_version?: string;
  environment?: string;
};

type LogClientOptions = {
  apiUrl?: string;
  apiKey?: string;
};

// Timeout acotado para no degradar el flujo principal (NFR-OBS-001).
const REQUEST_TIMEOUT_MS = 3000;

let cachedConfig: { url: string; key: string } | null = null;
let warnedIngestAlias = false;

function resolveConfig(
  options?: LogClientOptions,
): { url: string; key: string } | null {
  if (options?.apiUrl && options?.apiKey) {
    return { url: options.apiUrl, key: options.apiKey };
  }

  if (cachedConfig) return cachedConfig;

  const url = process.env.LOGS_API_URL;
  let key = process.env.LOGS_API_KEY;

  if (!key && process.env.LOGS_INGEST_API_KEY) {
    key = process.env.LOGS_INGEST_API_KEY;
    if (!warnedIngestAlias) {
      warnedIngestAlias = true;
      console.warn(
        '[@repo/api-utils] La variable "LOGS_INGEST_API_KEY" esta deprecada. Usa "LOGS_API_KEY" en su lugar. El alias se eliminara en una version futura.',
      );
    }
  }

  if (!url || !key) return null;

  cachedConfig = { url, key };
  return cachedConfig;
}

export function createLogClient(appName: string, options?: LogClientOptions) {
  return {
    async send(payload: Omit<LogPayload, "app">): Promise<void> {
      const config = resolveConfig(options);
      if (!config) return;

      const body: LogPayload = {
        app: appName,
        timestamp: new Date().toISOString(),
        ...payload,
      };

      try {
        await fetch(config.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": config.key,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch {
        // Fire-and-forget: un fallo de logging nunca debe romper la app emisora.
      }
    },

    debug(message: string, metadata?: Record<string, unknown>) {
      return this.send({ level: "debug", message, metadata });
    },

    info(message: string, metadata?: Record<string, unknown>) {
      return this.send({ level: "info", message, metadata });
    },

    warn(message: string, metadata?: Record<string, unknown>) {
      return this.send({ level: "warn", message, metadata });
    },

    error(
      message: string,
      metadata?: Record<string, unknown>,
      stackTrace?: string,
    ) {
      return this.send({
        level: "error",
        message,
        metadata,
        stack_trace: stackTrace,
      });
    },

    fatal(
      message: string,
      metadata?: Record<string, unknown>,
      stackTrace?: string,
    ) {
      return this.send({
        level: "fatal",
        message,
        metadata,
        stack_trace: stackTrace,
      });
    },
  };
}
