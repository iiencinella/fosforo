import { supabase } from "@/db/supabase";
import { getDefaultVersion } from "@/lib/data";
import { log } from "@/lib/log";

export type BibliaVersionOption = {
  code: string;
  name: string;
  isEnabled: boolean;
  isInternalOnly: boolean;
};

type BibliaVersionCatalog = {
  versions: BibliaVersionOption[];
  defaultVersionCode: string;
  errorMessage: string | null;
};

function getFallbackCatalog(): BibliaVersionCatalog {
  const fallback = getDefaultVersion();

  return {
    versions: [
      {
        code: fallback.code,
        name: fallback.name,
        isEnabled: true,
        isInternalOnly: true,
      },
    ],
    defaultVersionCode: fallback.code,
    errorMessage: null,
  };
}

export async function getBibleVersionCatalog(): Promise<BibliaVersionCatalog> {
  const fallback = getFallbackCatalog();

  const { data, error } = await supabase
    .from("biblia_versions")
    .select("code,name,is_enabled,is_internal_only")
    .order("name", { ascending: true });

  if (error) {
    log.error("Bible version lookup failed", { error });
    return {
      ...fallback,
      errorMessage: error.message,
    };
  }

  const mapped = (data ?? []).map((version) => ({
    code: version.code,
    name: version.name,
    isEnabled: version.is_enabled,
    isInternalOnly: version.is_internal_only,
  }));

  const enabledVersions = mapped.filter((version) => version.isEnabled);

  return {
    versions: enabledVersions.length > 0 ? enabledVersions : fallback.versions,
    defaultVersionCode: enabledVersions[0]?.code ?? fallback.defaultVersionCode,
    errorMessage: null,
  };
}

export async function getEnabledBibleVersion(code: string) {
  const { data, error } = await supabase
    .from("biblia_versions")
    .select("code,name,is_enabled,is_internal_only")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    log.error("Bible version lookup failed", { version: code, error });
    return {
      version: null,
      errorMessage: error.message,
    };
  }

  if (!data || !data.is_enabled) {
    return {
      version: null,
      errorMessage: null,
    };
  }

  return {
    version: {
      code: data.code,
      name: data.name,
      isEnabled: data.is_enabled,
      isInternalOnly: data.is_internal_only,
    } satisfies BibliaVersionOption,
    errorMessage: null,
  };
}
