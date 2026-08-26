import { supabase } from "@/db/supabase";

export async function createAuditLog(input: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
}) {
  await supabase.from("admin_audit_log").insert({
    user_id: input.userId,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId,
    details: input.details ?? {},
  });
}

export async function getDashboardMetrics() {
  const [{ count: templesCount }, { count: schedulesCount }, activity] =
    await Promise.all([
      supabase
        .from("horarios_temples")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("horarios_celebrations")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("admin_audit_log")
        .select("action, resource_type, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return {
    activeChurches: templesCount ?? 0,
    schedules: schedulesCount ?? 0,
    recentActivity: activity.data ?? [],
  };
}
