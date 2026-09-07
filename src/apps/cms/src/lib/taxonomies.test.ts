import { describe, expect, it } from "vitest";
import {
  flattenTerms,
  taxonomyCreateSchema,
  termCreateSchema,
} from "@/lib/taxonomies";
import type { TaxonomyRecord, TermRecord } from "@/lib/taxonomies";

describe("taxonomyCreateSchema (UC-CMS-010)", () => {
  it("acepta una taxonomia valida", () => {
    const parsed = taxonomyCreateSchema.safeParse({
      name: "Liturgia",
      slug: "liturgia",
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza slugs invalidos y nombres vacios", () => {
    expect(
      taxonomyCreateSchema.safeParse({ name: "Liturgia", slug: "Liturgia" })
        .success,
    ).toBe(false);
    expect(
      taxonomyCreateSchema.safeParse({ name: "", slug: "liturgia" }).success,
    ).toBe(false);
  });
});

describe("termCreateSchema (UC-CMS-010)", () => {
  it("acepta un termino con taxonomy_id uuid", () => {
    const parsed = termCreateSchema.safeParse({
      taxonomy_id: "3f1e2b2a-1b2c-4d3e-8f90-1a2b3c4d5e6f",
      name: "Adviento",
      slug: "adviento",
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza taxonomy_id no uuid y slug invalido", () => {
    expect(
      termCreateSchema.safeParse({
        taxonomy_id: "no-uuid",
        name: "x",
        slug: "x",
      }).success,
    ).toBe(false);
    expect(
      termCreateSchema.safeParse({
        taxonomy_id: "3f1e2b2a-1b2c-4d3e-8f90-1a2b3c4d5e6f",
        name: "Adviento",
        slug: "Adviento",
      }).success,
    ).toBe(false);
  });
});

describe("flattenTerms", () => {
  it("aplana los terminos con su taxonomia", () => {
    const taxonomy: TaxonomyRecord = {
      id: "t-1",
      name: "Liturgia",
      slug: "liturgia",
      createdAt: "2026-09-07T00:00:00.000Z",
      updatedAt: "2026-09-07T00:00:00.000Z",
      terms: [
        {
          id: "term-1",
          taxonomyId: "t-1",
          taxonomySlug: "liturgia",
          taxonomyName: "Liturgia",
          name: "Adviento",
          slug: "adviento",
        },
      ],
    };

    const terms: TermRecord[] = flattenTerms([taxonomy]);
    expect(terms).toHaveLength(1);
    expect(terms[0]?.taxonomySlug).toBe("liturgia");
    expect(terms[0]?.slug).toBe("adviento");
  });

  it("con taxonomias sin terminos devuelve vacio", () => {
    const taxonomy: TaxonomyRecord = {
      id: "t-2",
      name: "Temas",
      slug: "temas",
      createdAt: "2026-09-07T00:00:00.000Z",
      updatedAt: "2026-09-07T00:00:00.000Z",
      terms: [],
    };
    expect(flattenTerms([taxonomy])).toEqual([]);
  });
});
