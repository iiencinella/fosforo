/**
 * Preferencias de notificacion por usuario (FR-NOTIF-003, RB-NOTIF-002).
 *
 * Reglas:
 * - Las categorias obligatorias (transactional) se envian SIEMPRE,
 *   independientemente del opt-in del usuario.
 * - Default conservador: solo transactional esta optada por defecto;
 *   product, liturgical y community requieren opt-in explicito.
 * - Todas las funciones son puras: devuelven nuevos arrays.
 */
import {
  isMandatoryCategory,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  type NotificationCategory,
  type NotificationChannel,
} from "./channels.js";

export type NotificationPreference = {
  userId: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  optedIn: boolean;
};

export function defaultPreferences(userId: string): NotificationPreference[] {
  const preferences: NotificationPreference[] = [];
  for (const channel of NOTIFICATION_CHANNELS) {
    for (const category of NOTIFICATION_CATEGORIES) {
      preferences.push({
        userId,
        channel,
        category,
        optedIn: isMandatoryCategory(category),
      });
    }
  }
  return preferences;
}

export function canSend(
  preferences: readonly NotificationPreference[],
  userId: string,
  channel: NotificationChannel,
  category: NotificationCategory,
): boolean {
  if (isMandatoryCategory(category)) {
    return true;
  }
  const preference = preferences.find(
    (item) =>
      item.userId === userId &&
      item.channel === channel &&
      item.category === category,
  );
  return preference?.optedIn === true;
}

/**
 * Aplica un cambio de preferencia devolviendo un array nuevo. Si el par
 * canal+categoria no existia, lo crea. Los intentos de desactivar una
 * categoria obligatoria se ignoran (RB-NOTIF-002).
 */
export function applyPreferenceChange(
  preferences: readonly NotificationPreference[],
  change: {
    userId: string;
    channel: NotificationChannel;
    category: NotificationCategory;
    optedIn: boolean;
  },
): NotificationPreference[] {
  if (change.optedIn === false && isMandatoryCategory(change.category)) {
    return [...preferences];
  }

  const exists = preferences.some(
    (item) =>
      item.userId === change.userId &&
      item.channel === change.channel &&
      item.category === change.category,
  );

  if (!exists) {
    return [...preferences, { ...change }];
  }

  return preferences.map((item) =>
    item.userId === change.userId &&
    item.channel === change.channel &&
    item.category === change.category
      ? { ...item, optedIn: change.optedIn }
      : item,
  );
}
