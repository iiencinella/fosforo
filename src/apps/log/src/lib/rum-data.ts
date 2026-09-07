import { z } from "zod";

/**
 * Registro de apps del ecosistema: raices validas de la taxonomia de eventos
 * RUM. Una app nueva debe agregarse aqui (whitelist centralizada,
 * ADR-LOG-RUM-007) antes de poder reportar eventos con su prefijo.
 */
export const RUM_APP_REGISTRY = [
  "portal",
  "biblia",
  "calendario",
  "cancionero",
  "horarios",
  "usuario",
  "administracion",
  "log",
  "logueo",
  "misal",
  "oraciones",
  "santopedia",
  "lectio",
  "misiones",
  "visita7",
] as const;

export type RumApp = (typeof RUM_APP_REGISTRY)[number];

/**
 * Eventos reservados sin prefijo de app (FR-LOG-RUM-002).
 */
export const RESERVED_EVENT_NAMES = ["pageview", "frontend.error"] as const;

const NAMESPACED_PATTERN =
  /^[a-z][a-z0-9_-]{0,30}(\.[a-z][a-z0-9_-]{0,30}){1,3}$/;

export const rumEventNameSchema = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .refine(
    (name) => {
      if ((RESERVED_EVENT_NAMES as readonly string[]).includes(name)) {
        return true;
      }
      if (!NAMESPACED_PATTERN.test(name)) {
        return false;
      }
      const root = name.split(".")[0];
      return (
        root !== undefined &&
        (RUM_APP_REGISTRY as readonly string[]).includes(root)
      );
    },
    { message: "Event name not in taxonomy" },
  );

export type RumEventName = z.infer<typeof rumEventNameSchema>;

export const rumSessionIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{16,64}$/i, "session_id_anon must be 16-64 hex chars");

export const rumEventPayloadSchema = z.object({
  app: z.enum(RUM_APP_REGISTRY),
  event_name: rumEventNameSchema,
  page_url: z.string().max(2048).optional(),
  page_path: z.string().max(500).optional(),
  session_id_anon: rumSessionIdSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  app_version: z.string().max(20).optional(),
  environment: z.string().max(20).optional(),
  timestamp: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid timestamp",
    }),
  has_consent: z.boolean().default(true),
});

export type RumEventPayload = z.infer<typeof rumEventPayloadSchema>;

export const vitalMetricNameSchema = z.enum(["LCP", "INP", "CLS"]);

export const vitalRatingSchema = z.enum(["good", "needs-improvement", "poor"]);

export const rumVitalPayloadSchema = z.object({
  app: z.enum(RUM_APP_REGISTRY),
  page_url: z.string().max(2048).optional(),
  page_path: z.string().max(500).optional(),
  metric_name: vitalMetricNameSchema,
  metric_value: z.number().min(0),
  rating: vitalRatingSchema,
  session_id_anon: rumSessionIdSchema,
  app_version: z.string().max(20).optional(),
  timestamp: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "Invalid timestamp",
    }),
});

export type RumVitalPayload = z.infer<typeof rumVitalPayloadSchema>;

/**
 * Limite de tamanio del objeto metadata en bytes (JSON serializado).
 */
export const METADATA_MAX_BYTES = 8192;

/**
 * Patron de PII sobre valores string de metadata (SEC-LOG-RUM-001/004).
 * Solo se escanean strings: numeros y fechas del payload no generan
 * falsos positivos.
 */
const PII_STRING_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  {
    label: "email",
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  },
  {
    label: "ipv4",
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  },
  {
    label: "ipv6",
    pattern: /(?:[A-Fa-f0-9]{1,4}:){4,7}[A-Fa-f0-9]{1,4}/,
  },
  {
    label: "dni",
    pattern: /\b\d{1,3}\.\d{3}\.\d{3}\b/,
  },
];

/**
 * Recorre el valor y devuelve las rutas donde un string contiene PII.
 * Solo inspecciona strings; objetos y arrays se recorren recursivamente.
 */
export function findPiiViolations(value: unknown, path = ""): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === "string") {
    for (const { label, pattern } of PII_STRING_PATTERNS) {
      if (pattern.test(value)) {
        return [path || label];
      }
    }
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      findPiiViolations(item, `${path}[${index}]`),
    );
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => findPiiViolations(item, path ? `${path}.${key}` : key),
    );
  }

  return [];
}

export type RumSamplingConfig = {
  pageview: number;
  custom: number;
  error: number;
};

export const DEFAULT_SAMPLING: RumSamplingConfig = {
  pageview: 1,
  custom: 0.1,
  error: 1,
};

/**
 * Decide si un evento pasa el sampling segun su tipo (RB-LOG-RUM-003).
 * pageview y frontend.error usan su bucket propio; los eventos de producto
 * usan el bucket custom.
 */
export function samplingAllows(
  config: RumSamplingConfig,
  eventName: string,
): boolean {
  if (eventName === "pageview") {
    return Math.random() < config.pageview;
  }
  if (eventName === "frontend.error") {
    return Math.random() < config.error;
  }
  return Math.random() < config.custom;
}
