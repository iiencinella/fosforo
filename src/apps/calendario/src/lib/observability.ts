export function logCalendarError(event: string, error: unknown): void {
  console.error(
    JSON.stringify({
      app: "calendario",
      event,
      error: error instanceof Error ? error.message : "unknown_error",
      timestamp: new Date().toISOString(),
    }),
  );
}
