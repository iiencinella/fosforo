/**
 * @repo/notification-core — logica pura del Sistema de Notificaciones.
 *
 * Contratos: FASE_2-Sistema-de-Notificaciones/WEB (02-SRS, 03-FRD) y
 * docs/plans/2026-09-05-plan-desarrollo-fase-0.md (paso 6).
 *
 * Sin DB ni red: la persistencia (tablas notification_*, paso 7) y los
 * proveedores de envio (app Notificaciones) consumen estos helpers.
 */
export {
  isMandatoryCategory,
  isNotificationCategory,
  isNotificationChannel,
  MANDATORY_CATEGORIES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from "./channels.js";
export type { NotificationCategory, NotificationChannel } from "./channels.js";

export {
  extractVariables,
  newTemplateVersion,
  publishTemplate,
  renderTemplate,
  TemplateRenderError,
  validateTemplateDefinition,
  VARIABLE_PATTERN,
} from "./templates.js";
export type {
  PublishedTemplate,
  RenderedTemplate,
  TemplateDefinition,
  TemplateVariables,
} from "./templates.js";

export {
  applyPreferenceChange,
  canSend,
  defaultPreferences,
} from "./preferences.js";
export type { NotificationPreference } from "./preferences.js";

export {
  backoffDelayMs,
  canAttempt,
  enqueue,
  isDuplicateEvent,
  isRetryDue,
  markDelivered,
  markOpened,
  MAX_DELIVERY_ATTEMPTS,
  recordAttempt,
} from "./queue.js";
export type {
  AttemptResult,
  EnqueueInput,
  QueueItem,
  QueueItemStatus,
} from "./queue.js";
