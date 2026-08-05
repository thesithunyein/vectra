import type { User } from "@supabase/supabase-js";
import type { WorkspacePrefs } from "@/lib/workspace";
import { EMPTY_WORKSPACE } from "@/lib/workspace";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  plant: string;
  plantSite: string;
  shift: string;
  avatarUrl?: string | null;
};

export function userFromSupabase(
  user: User,
  workspace: WorkspacePrefs = EMPTY_WORKSPACE
): AppUser {
  const meta = user.user_metadata ?? {};
  const name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (meta.user_name as string) ||
    user.email?.split("@")[0] ||
    "Plant user";
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    role: workspace.role,
    initials,
    plant: workspace.plant,
    plantSite: workspace.plantSite,
    shift: workspace.shift,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
