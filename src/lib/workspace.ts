export type WorkspacePrefs = {
  plant: string;
  plantSite: string;
  shift: string;
  role: string;
  sampleData: boolean;
};

export const EMPTY_WORKSPACE: WorkspacePrefs = {
  plant: "My plant",
  plantSite: "Site not set",
  shift: "Shift not set",
  role: "Member",
  sampleData: false,
};

function storageKey(userId: string) {
  return `vectra_workspace_${userId}`;
}

export function loadWorkspace(userId: string): WorkspacePrefs {
  if (typeof window === "undefined") return { ...EMPTY_WORKSPACE };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...EMPTY_WORKSPACE };
    return { ...EMPTY_WORKSPACE, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_WORKSPACE };
  }
}

export function saveWorkspace(userId: string, patch: Partial<WorkspacePrefs>): WorkspacePrefs {
  const next = { ...loadWorkspace(userId), ...patch };
  localStorage.setItem(storageKey(userId), JSON.stringify(next));
  return next;
}
