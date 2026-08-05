export const CURRENT_USER = {
  id: "u-farah",
  name: "Farah Aziz",
  email: "farah@apex-precision.my",
  role: "Ops Lead",
  initials: "FA",
  plant: "Apex Precision",
  plantSite: "Shah Alam Plant 2",
  shift: "Day shift",
} as const;

export const SESSION_KEY = "vectra_session";

export type Session = {
  userId: string;
  name: string;
  email: string;
  role: string;
  signedInAt: string;
};

export function createSession(): Session {
  return {
    userId: CURRENT_USER.id,
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    role: CURRENT_USER.role,
    signedInAt: new Date().toISOString(),
  };
}
