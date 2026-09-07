import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Auditoria de accesos en public.audit_log (FR-AUTH-005, RB-AUTH:
 * auditoria inmutable). Se inserta con el cliente service_role: la tabla
 * es insert-only para usuarios via RLS y el backend registra en nombre del
 * usuario autenticado.
 */
export async function recordAuditEvent(input: {
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("audit_log").insert({
      user_id: input.userId,
      action: input.action,
      metadata: input.metadata ?? {},
      ip_address: input.ipAddress ?? null,
    });
    if (error) {
      // La auditoria no debe romper el flujo de login/logout.
      console.warn(`[logueo] auditoria fallida: ${String(error)}`);
    }
  } catch (error) {
    console.warn(`[logueo] auditoria fallida: ${String(error)}`);
  }
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) {
      return first.trim();
    }
  }
  return request.headers.get("x-real-ip") ?? null;
}
