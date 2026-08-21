import { getPortalSupabaseServerClient } from "@/lib/supabase-server";

export type ContactSubmission = {
  name: string;
  email: string;
  message: string;
};

export type FeedbackSubmission = {
  name: string;
  contactChannel: string;
  category: "producto" | "contenido" | "ux";
  message: string;
};

type SubmissionResult = {
  id: string;
};

export async function checkPortalSupabase(): Promise<boolean> {
  const { error } = await getPortalSupabaseServerClient()
    .from("portal_submission_audit")
    .select("id")
    .limit(1);

  return !error;
}

async function recordAudit(
  submissionType: "contact" | "feedback",
  submissionId: string,
): Promise<void> {
  const { error } = await getPortalSupabaseServerClient()
    .from("portal_submission_audit")
    .insert({
      submission_type: submissionType,
      submission_id: submissionId,
      event_type: "created",
      actor: "portal",
    });

  if (error) throw error;
}

export async function createContactSubmission(
  submission: ContactSubmission,
): Promise<SubmissionResult> {
  const { data, error } = await getPortalSupabaseServerClient()
    .from("portal_contact_requests")
    .insert({
      name: submission.name,
      email: submission.email,
      message: submission.message,
    })
    .select("id")
    .single();

  if (error) throw error;
  await recordAudit("contact", data.id);
  return { id: data.id };
}

export async function createFeedbackSubmission(
  submission: FeedbackSubmission,
): Promise<SubmissionResult> {
  const { data, error } = await getPortalSupabaseServerClient()
    .from("portal_feedback_items")
    .insert({
      name: submission.name,
      contact_channel: submission.contactChannel,
      category: submission.category,
      message: submission.message,
    })
    .select("id")
    .single();

  if (error) throw error;
  await recordAudit("feedback", data.id);
  return { id: data.id };
}
