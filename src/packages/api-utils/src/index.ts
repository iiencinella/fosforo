type APIHandler = (context: {
  request: Request;
  url: URL;
  params: Record<string, string | undefined>;
}) => Response | Promise<Response>;

type SafeHandlerOptions = {
  fallbackMessage?: string;
};

const JSON_HEADERS = { "content-type": "application/json" } as const;

export function safeHandler(
  handler: APIHandler,
  options: SafeHandlerOptions = {},
): APIHandler {
  const { fallbackMessage = "Internal server error" } = options;

  return async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(fallbackMessage);

      console.error("[API Error]", context.url.pathname, message);

      return new Response(
        JSON.stringify({ ok: false, error: fallbackMessage }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
  };
}

export function jsonOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status,
    headers: JSON_HEADERS,
  });
}

export function jsonError(error: string, status = 400): Response {
  return new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: JSON_HEADERS,
  });
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
