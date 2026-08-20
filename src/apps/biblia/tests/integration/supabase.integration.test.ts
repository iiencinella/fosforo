import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_KEY ??
  process.env.PUBLIC_SUPABASE_ANON_KEY;
const enabled = process.env.BIBLIA_RUN_INTEGRATION === "true";

const integration = describe.skipIf(!enabled || !url || !anonKey);

integration("Supabase integration", () => {
  const getSupabase = () => createClient(url as string, anonKey as string);

  it("reads the enabled version through the public data contract", async () => {
    const { data, error } = await getSupabase()
      .from("biblia_versions")
      .select("code,is_enabled,is_internal_only")
      .eq("is_enabled", true);

    expect(error).toBeNull();
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(String),
          is_enabled: true,
          is_internal_only: expect.any(Boolean),
        }),
      ]),
    );
  });

  it("resolves a chapter through the server RPC contract", async () => {
    const { data, error } = await getSupabase().rpc("biblia_read_chapter", {
      p_version_code: "pd",
      p_book_slug: "juan",
      p_chapter_number: 3,
    });

    expect(error).toBeNull();
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          version_code: "pd",
          book_slug: "juan",
          chapter_number: 3,
        }),
      ]),
    );
  });

  it("returns no liturgy for a date outside the dataset", async () => {
    const { data, error } = await getSupabase().rpc("biblia_get_liturgy_day", {
      p_date: "1900-01-01",
      p_rite: "roman",
      p_region_code: "AR",
    });

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("does not allow the public role to read ingestion runs", async () => {
    const { data, error } = await getSupabase()
      .from("biblia_ingestion_runs")
      .select("id")
      .limit(1);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("does not allow the public role to write ingestion runs", async () => {
    const { error } = await getSupabase().from("biblia_ingestion_runs").insert({
      source_name: "integration-test",
      run_status: "running",
    });

    expect(error).not.toBeNull();
  });
});
