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
  const [{ count: churchesCount }, { count: schedulesCount }, activity] =
    await Promise.all([
      supabase
        .from("churches")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("celebration_schedules")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("admin_audit_log")
        .select("action, resource_type, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return {
    activeChurches: churchesCount ?? 0,
    schedules: schedulesCount ?? 0,
    recentActivity: activity.data ?? [],
  };
}
