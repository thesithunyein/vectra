import type { User } from "@supabase/supabase-js";

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

export const PLANT_DEFAULTS = {
  plant: "Apex Precision",
  plantSite: "Shah Alam Plant 2",
  shift: "Day shift",
  role: "Ops Lead",
} as const;

export function userFromSupabase(user: User): AppUser {
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
    role: PLANT_DEFAULTS.role,
    initials,
    plant: PLANT_DEFAULTS.plant,
    plantSite: PLANT_DEFAULTS.plantSite,
    shift: PLANT_DEFAULTS.shift,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
  };
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
