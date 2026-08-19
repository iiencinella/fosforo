import { readEnv, requireEnv } from "./reader.js";

export type AdminEnv = {
  sessionCookie: string;
  sessionMaxAge: number;
  allowedEmailDomain: string;
};

export function getAdminEnv(): AdminEnv {
  const sessionCookie = readEnv("ADMIN_SESSION_COOKIE") || "admin_session";
  const sessionMaxAge = Number(
    readEnv("ADMIN_SESSION_MAX_AGE_SECONDS") || "28800",
  );
  const allowedEmailDomain = readEnv("ADMIN_ALLOWED_EMAIL_DOMAIN") || "";

  return { sessionCookie, sessionMaxAge, allowedEmailDomain };
}

export function requireAdminEnv(): AdminEnv {
  const sessionCookie = requireEnv("ADMIN_SESSION_COOKIE");
  const sessionMaxAge = Number(requireEnv("ADMIN_SESSION_MAX_AGE_SECONDS"));
  const allowedEmailDomain = readEnv("ADMIN_ALLOWED_EMAIL_DOMAIN") || "";

  return { sessionCookie, sessionMaxAge, allowedEmailDomain };
}
