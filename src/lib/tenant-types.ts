export type PlantRole = "owner" | "ops_lead" | "maintenance" | "vendor";

export type PlantTenant = {
  id: string;
  name: string;
  site: string;
  inviteCode: string;
  role: PlantRole;
  memberCount: number;
};

export function canWritePlant(role: PlantRole): boolean {
  return role === "owner" || role === "ops_lead" || role === "maintenance";
}

export function canCloseMaintenance(role: PlantRole): boolean {
  return role === "owner" || role === "ops_lead" || role === "maintenance";
}

export function canManageTeam(role: PlantRole): boolean {
  return role === "owner";
}

export function roleLabel(role: PlantRole): string {
  switch (role) {
    case "owner":
      return "Plant Owner";
    case "ops_lead":
      return "Ops Lead";
    case "maintenance":
      return "Maintenance Supervisor";
    case "vendor":
      return "Vendor (read-only)";
  }
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function mqttTopicForKey(apiKey: string): string {
  const slug = apiKey.replace(/^vk_/, "").slice(0, 12);
  return `vectra/plant/${slug}/telemetry`;
}
