import { readEnv, requireEnv } from "./reader.js";

export type PortalEnv = {
  whatsappNumber: string;
  resendApiKey: string;
  feedbackEmailTo: string;
};

export function getPortalEnv(): PortalEnv {
  const whatsappNumber =
    readEnv("PUBLIC_PORTAL_WHATSAPP_NUMBER") || "543434708954";
  const resendApiKey = readEnv("RESEND_API_KEY");
  const feedbackEmailTo = readEnv("FEEDBACK_EMAIL_TO");

  return { whatsappNumber, resendApiKey, feedbackEmailTo };
}

export function requirePortalEnv(): PortalEnv {
  const whatsappNumber =
    readEnv("PUBLIC_PORTAL_WHATSAPP_NUMBER") || "543434708954";
  const resendApiKey = requireEnv("RESEND_API_KEY");
  const feedbackEmailTo = requireEnv("FEEDBACK_EMAIL_TO");

  return { whatsappNumber, resendApiKey, feedbackEmailTo };
}
