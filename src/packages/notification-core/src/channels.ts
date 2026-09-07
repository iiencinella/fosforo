/**
 * Canales y categorias de notificacion del ecosistema Fosforo.
 *
 * Contratos: FASE_2-Sistema-de-Notificaciones/WEB 02-SRS (FR-NOTIF-002/003),
 * 03-FRD (RB-NOTIF-002: las categorias obligatorias ignoran preferencias).
 */

export const NOTIFICATION_CHANNELS = ["email", "push", "in_app"] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CATEGORIES = [
  "transactional",
  "product",
  "liturgical",
  "community",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

/**
 * Categorias obligatorias: seguridad, confirmaciones y comprobantes.
 * Un usuario NO puede desactivarlas (RB-NOTIF-002).
 */
export const MANDATORY_CATEGORIES: readonly NotificationCategory[] = [
  "transactional",
];

export function isMandatoryCategory(category: NotificationCategory): boolean {
  return MANDATORY_CATEGORIES.includes(category);
}

export function isNotificationChannel(
  value: unknown,
): value is NotificationChannel {
  return (
    typeof value === "string" &&
    (NOTIFICATION_CHANNELS as readonly string[]).includes(value)
  );
}

export function isNotificationCategory(
  value: unknown,
): value is NotificationCategory {
  return (
    typeof value === "string" &&
    (NOTIFICATION_CATEGORIES as readonly string[]).includes(value)
  );
}
