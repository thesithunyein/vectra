"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isCloudUserId } from "@/lib/plant-db";
import { fetchTenantInfo, joinPlantTeam } from "@/lib/plant-cloud";
import { useStore } from "@/lib/store";
import {
  canManageTeam,
  roleLabel,
  type PlantRole,
  type PlantTenant,
} from "@/lib/tenant-types";

const JOIN_ROLES: PlantRole[] = ["ops_lead", "maintenance", "vendor"];

export function TeamPanel() {
  const { user, plantRole, tenant, refreshTenant } = useAuth();
  const { refreshFromCloud } = useStore();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinRole, setJoinRole] = useState<PlantRole>("maintenance");
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [localTenant, setLocalTenant] = useState<PlantTenant | null>(tenant);

  const cloudUser = user && isCloudUserId(user.id);
  const role = plantRole ?? localTenant?.role ?? "owner";
  const activeTenant = tenant ?? localTenant;

  const load = useCallback(async () => {
    if (!cloudUser) return;
    setLoading(true);
    const info = await fetchTenantInfo();
    if (info?.tenant) setLocalTenant(info.tenant);
    setLoading(false);
  }, [cloudUser]);

  useEffect(() => {
    void load();
  }, [load, tenant]);

  function copyInvite(code: string) {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setJoining(true);
    setMessage(null);
    const result = await joinPlantTeam(inviteCode.trim(), joinRole);
    if (result.ok && result.tenant) {
      setLocalTenant(result.tenant);
      await refreshTenant();
      await refreshFromCloud();
      setMessage(`Joined ${result.tenant.name} as ${roleLabel(result.tenant.role)}.`);
      setInviteCode("");
    } else {
      setMessage(result.error ?? "Could not join plant team.");
    }
    setJoining(false);
  }

  if (!cloudUser) {
    return (
      <div className="card p-6">
        <h3 className="text-[15px] font-medium">Plant team</h3>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Multi-tenant plant ops require Google or email sign-in so teammates share one workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium">Plant team</h3>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            One plant workspace for ops lead, maintenance, and read-only vendor access. Share the
            invite code with shift supervisors on the same line.
          </p>
        </div>
        <Users className="h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
      </div>

      {loading && !activeTenant ? (
        <p className="mt-4 text-[13px] text-[var(--text-muted)]">Loading team…</p>
      ) : activeTenant ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[12px] text-[var(--text-muted)]">Plant</div>
              <div className="text-[13px] font-medium">{activeTenant.name}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--text-muted)]">Site</div>
              <div className="text-[13px]">{activeTenant.site}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--text-muted)]">Your access</div>
              <div className="text-[13px]">{roleLabel(role)}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--text-muted)]">Members</div>
              <div className="text-[13px]">{activeTenant.memberCount}</div>
            </div>
          </div>

          {canManageTeam(role) && (
            <div>
              <div className="text-[12px] text-[var(--text-muted)]">Invite code</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-[12px] tracking-widest">
                  {activeTenant.inviteCode}
                </code>
                <button
                  type="button"
                  onClick={() => copyInvite(activeTenant.inviteCode)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] hover:bg-[var(--bg-hover)]"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>
              <p className="mt-2 text-[12px] text-[var(--text-muted)]">
                Teammates join in Settings → Plant team with this code. Vendors get read-only
                console access.
              </p>
            </div>
          )}

          {role === "vendor" && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-400">
              Vendor role: view devices, alerts, and sealed records. Cannot import data or close
              maintenance.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-[var(--text-secondary)]">
          Save your plant workspace to auto-create a team, or join an existing plant below.
        </p>
      )}

      <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
        <div className="text-[13px] font-medium">Join a plant</div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="text-[12px] text-[var(--text-muted)]">Invite code</span>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] uppercase outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block sm:w-44">
            <span className="text-[12px] text-[var(--text-muted)]">Role</span>
            <select
              value={joinRole}
              onChange={(e) => setJoinRole(e.target.value as PlantRole)}
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
            >
              {JOIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={joining || !inviteCode.trim()}
            onClick={() => void handleJoin()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:opacity-40"
          >
            {joining ? "Joining…" : "Join plant"}
          </button>
        </div>
        {message && <p className="mt-2 text-[12px] text-[var(--text-secondary)]">{message}</p>}
      </div>
    </div>
  );
}
