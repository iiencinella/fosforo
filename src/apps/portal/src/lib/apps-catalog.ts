import type { CollectionEntry } from "astro:content";

export const CATEGORY_ORDER = [
  "contenido",
  "formación",
  "comúnidad",
  "servicio",
  "herramienta",
] as const;

export const CATEGORY_LABELS: Record<(typeof CATEGORY_ORDER)[number], string> =
  {
    contenido: "Contenido",
    formación: "Formación",
    comúnidad: "Comunidad",
    servicio: "Servicio",
    herramienta: "Herramienta",
  };

export const CATEGORY_DESCRIPTIONS: Record<
  (typeof CATEGORY_ORDER)[number],
  string
> = {
  contenido:
    "Recursos para leer, rezar y descubrir contenidos que acompanan la vida diaria de la fe.",
  formación:
    "Propuestas para aprender, profundizar y crecer con mas claridad en el camino espiritual.",
  comúnidad:
    "Experiencias pensadas para conectar personas, grupos y espacios de participación compartida.",
  servicio:
    "Herramientas orientadas a resolver necesidades concretas con cercania, cuidado y acompanamiento.",
  herramienta:
    "Puertas de acceso y apoyos practicos para recorrer mejor todo el ecosistema Fósforo.",
};

export function getCategoryRank(category: string): number {
  const rank = CATEGORY_ORDER.indexOf(
    category as (typeof CATEGORY_ORDER)[number],
  );
  return rank === -1 ? CATEGORY_ORDER.length : rank;
}

export function getCategoryLabel(category: string): string {
  return (
    CATEGORY_LABELS[category as (typeof CATEGORY_ORDER)[number]] ?? category
  );
}

export function getCategoryDescription(category: string): string {
  return (
    CATEGORY_DESCRIPTIONS[category as (typeof CATEGORY_ORDER)[number]] ??
    "Aplicaciones relaciónadas dentro del ecosistema Fósforo."
  );
}

export function sortAppsCatalogEntries(
  entries: CollectionEntry<"appsCatalog">[],
) {
  return [...entries].sort((a, b) => {
    const rankDiff =
      getCategoryRank(a.data.category) - getCategoryRank(b.data.category);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    return a.data.name.localeCompare(b.data.name, "es");
  });
}
