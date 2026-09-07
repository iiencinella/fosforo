/**
 * Plantillas de notificacion versionadas (FR-NOTIF-001, RB-NOTIF-001).
 *
 * Reglas:
 * - Las versiones publicadas son inmutables: el paquete no expone ninguna
 *   funcion de edicion sobre PublishedTemplate; la unica forma de cambiar
 *   una plantilla es crear una version nueva con newTemplateVersion().
 * - El render es estricto: si falta una variable usada por subject o body,
 *   falla con TemplateRenderError sin enviar nada (RB-NOTIF-005).
 */
import {
  isNotificationCategory,
  isNotificationChannel,
  type NotificationCategory,
  type NotificationChannel,
} from "./channels.js";

export const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

export type TemplateVariables = Record<string, string>;

export type TemplateDefinition = {
  id: string;
  name: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  subject: string;
  body: string;
};

export type PublishedTemplate = Readonly<
  TemplateDefinition & { version: number; requiredVariables: readonly string[] }
>;

export class TemplateRenderError extends Error {
  readonly missingVariables: readonly string[];

  constructor(missingVariables: readonly string[]) {
    super(
      `Faltan variables requeridas en la plantilla: ${missingVariables.join(", ")}`,
    );
    this.name = "TemplateRenderError";
    this.missingVariables = missingVariables;
  }
}

export function extractVariables(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    const name = match[1];
    if (name) {
      found.add(name);
    }
  }
  return Array.from(found).sort();
}

export function validateTemplateDefinition(
  definition: unknown,
): definition is TemplateDefinition {
  if (typeof definition !== "object" || definition === null) {
    return false;
  }
  const candidate = definition as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.name === "string" &&
    typeof candidate.subject === "string" &&
    typeof candidate.body === "string" &&
    isNotificationChannel(candidate.channel) &&
    isNotificationCategory(candidate.category)
  );
}

/**
 * Publica una plantilla calculando su version y sus variables requeridas.
 */
export function publishTemplate(
  definition: TemplateDefinition,
  existingVersionCount: number,
): PublishedTemplate {
  const requiredVariables = Array.from(
    new Set([
      ...extractVariables(definition.subject),
      ...extractVariables(definition.body),
    ]),
  ).sort();

  return Object.freeze({
    ...definition,
    version: existingVersionCount + 1,
    requiredVariables,
  });
}

/**
 * Crea la version siguiente con cambios (RB-NOTIF-001): las versiones
 * publicadas nunca se editan, siempre se deriva una version nueva.
 */
export function newTemplateVersion(
  published: PublishedTemplate,
  changes: Partial<Pick<TemplateDefinition, "name" | "subject" | "body">>,
): PublishedTemplate {
  return publishTemplate(
    {
      id: published.id,
      name: changes.name ?? published.name,
      channel: published.channel,
      category: published.category,
      subject: changes.subject ?? published.subject,
      body: changes.body ?? published.body,
    },
    published.version,
  );
}

export type RenderedTemplate = {
  subject: string;
  body: string;
};

function replaceVariables(
  text: string,
  variables: TemplateVariables,
): { text: string; missing: string[] } {
  const missing = new Set<string>();
  const replaced = text.replace(VARIABLE_PATTERN, (full, name: string) => {
    const value = variables[name];
    if (value === undefined) {
      missing.add(name);
      return full;
    }
    return value;
  });
  return { text: replaced, missing: Array.from(missing) };
}

/**
 * Render estricto de una version publicada. Si falta alguna variable,
 * lanza TemplateRenderError con la lista completa (sin parcializar).
 */
export function renderTemplate(
  template: PublishedTemplate,
  variables: TemplateVariables,
): RenderedTemplate {
  const subject = replaceVariables(template.subject, variables);
  const body = replaceVariables(template.body, variables);
  const missing = Array.from(
    new Set([...subject.missing, ...body.missing]),
  ).sort();

  if (missing.length > 0) {
    throw new TemplateRenderError(missing);
  }

  return { subject: subject.text, body: body.text };
}
