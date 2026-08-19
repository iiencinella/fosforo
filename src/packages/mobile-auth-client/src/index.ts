export type MobileSession = {
  accessToken: string;
  expiresIn: number;
  userId: string;
};

export type MobileRuntimeConfig = {
  apiBaseUrl: string;
  demoUserId: string;
};

type JsonResponse<T> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

export const getMobileRuntimeConfig = (fallbackUserId: string) => {
  const env =
    (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env ?? {};

  const apiBaseUrl = env.EXPO_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is not set. " +
        "Define it in your .env file or environment variables.",
    );
  }

  return {
    apiBaseUrl,
    demoUserId: env.EXPO_PUBLIC_DEMO_USER_ID ?? fallbackUserId,
  } satisfies MobileRuntimeConfig;
};

export const resolveActiveUserId = (
  sessionUserId: string | null | undefined,
  demoUserId: string,
) => {
  return sessionUserId ?? demoUserId;
};

export const loginMobile = async (
  baseUrl: string,
  email: string,
  password: string,
  fetcher: typeof fetch = fetch,
) => {
  const response = await fetcher(`${baseUrl}/api/auth/mobile-login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as JsonResponse<MobileSession>;
  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.error ?? `HTTP ${response.status}`);
  }

  return payload.data;
};
