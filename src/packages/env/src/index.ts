export { readEnv, requireEnv } from "./reader.js";
export { isProduction, isDevelopment } from "./common.js";

export {
  getSupabaseEnv,
  getSupabaseFullEnv,
  getSupabaseServiceRoleKey,
  readSupabaseEnv,
} from "./supabase.js";
export type { SupabaseEnv, SupabaseFullEnv } from "./supabase.js";

export { getAdminEnv, requireAdminEnv } from "./admin.js";
export type { AdminEnv } from "./admin.js";

export { getBibliaEnv, requireBibliaEnv } from "./biblia.js";
export type { BibliaEnv } from "./biblia.js";

export { getPortalEnv, requirePortalEnv } from "./portal.js";
export type { PortalEnv } from "./portal.js";
