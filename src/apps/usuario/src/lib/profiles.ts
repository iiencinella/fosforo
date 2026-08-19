import {
  getSupabaseAuthClient,
  getUserProfileById as sharedGetUserProfileById,
  type UserProfile as SharedUserProfile,
} from "@repo/auth";

export type UserProfile = SharedUserProfile;

export const getUserProfileById = sharedGetUserProfileById;

export async function updateUserProfile(
  userId: string,
  payload: {
    name?: string;
    avatarUrl?: string | null;
  },
) {
  const supabase = getSupabaseAuthClient();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof payload.name === "string") {
    updates.name = payload.name;
  }

  if (payload.avatarUrl !== undefined) {
    updates.avatar_url = payload.avatarUrl;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error("USERS_PROFILE_UPDATE_FAILED");
  }

  return getUserProfileById(userId);
}
