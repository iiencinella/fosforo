import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_KEY ??
  process.env.PUBLIC_SUPABASE_ANON_KEY;
const enabled = process.env.CALENDARIO_RUN_INTEGRATION === "true";
const integration = describe.skipIf(!enabled || !url || !anonKey);

integration("Calendario Supabase integration", () => {
  const getSupabase = () => createClient(url as string, anonKey as string);

  it("reads the public daily dataset within the agreed scope", async () => {
    const { data, error } = await getSupabase()
      .from("liturgy_daily_readings")
      .select("reading_date,rite,region_code")
      .eq("rite", "roman")
      .eq("region_code", "AR")
      .limit(1);

    expect(error).toBeNull();
    expect(data?.length).toBe(1);
  });

  it("reads the 365-day profile projection publicly", async () => {
    const { count, error } = await getSupabase()
      .from("liturgy_day_profiles")
      .select("id", { count: "exact", head: true })
      .eq("rite", "roman")
      .eq("region_code", "AR");

    expect(error).toBeNull();
    expect(count).toBe(365);
  });

  it("does not allow the public role to write calendar data", async () => {
    const { error } = await getSupabase().from("liturgy_day_profiles").insert({
      month_day_key: "01-01",
      rite: "roman",
      region_code: "AR",
      liturgical_season: "test",
      liturgical_color: "verde",
    });

    expect(error).not.toBeNull();
  });
});
