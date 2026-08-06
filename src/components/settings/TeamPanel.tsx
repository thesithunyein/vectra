"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isCloudUserId } from "@/lib/plant-db";
import { createPlantTeam, fetchTenantInfo, joinPlantTeam } from "@/lib/plant-cloud";
import { getAppUrl } from "@/lib/auth";
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
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinRole, setJoinRole] = useState<PlantRole>("maintenance");
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
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

  function copyText(label: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreateTeam() {
    if (!user) return;
    setCreating(true);
    setMessage(null);
    const result = await createPlantTeam(user.plant, user.plantSite);
    if (result.ok && result.tenant) {
      setLocalTenant(result.tenant);
      await refreshTenant();
      await refreshFromCloud();
      setMessage(`Plant team created. Share invite code ${result.tenant.inviteCode} with your shift.`);
    } else {
      setMessage(result.error ?? "Could not create plant team.");
      setSetupUrl(result.setupUrl ?? null);
    }
    setCreating(false);
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoining(true);
    setMessage(null);
    const result = await joinPlantTeam(joinCode.trim(), joinRole);
    if (result.ok && result.tenant) {
      setLocalTenant(result.tenant);
      await refreshTenant();
      await refreshFromCloud();
      setMessage(`Joined ${result.tenant.name} as ${roleLabel(result.tenant.role)}.`);
      setJoinCode("");
    } else {
      setMessage(result.error ?? "Could not join plant team.");
    }
    setJoining(false);
  }

  const inviteLink = activeTenant
    ? `${getAppUrl().replace(/\/$/, "")}/settings?join=${activeTenant.inviteCode}`
    : "";

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
            <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <div>
                <div className="text-[12px] text-[var(--text-muted)]">Your invite code</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <code className="rounded-lg bg-[var(--bg-base)] px-3 py-2 text-[14px] font-medium tracking-widest">
                    {activeTenant.inviteCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText("code", activeTenant.inviteCode)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] hover:bg-[var(--bg-hover)]"
                  >
                    <Copy className="h-3 w-3" />
                    {copied === "code" ? "Copied" : "Copy code"}
                  </button>
                </div>
              </div>
              {inviteLink && (
                <div>
                  <div className="text-[12px] text-[var(--text-muted)]">Invite link</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <code className="max-w-full truncate rounded-lg bg-[var(--bg-base)] px-3 py-2 text-[11px]">
                      {inviteLink}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyText("link", inviteLink)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-[11px] hover:bg-[var(--bg-hover)]"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === "link" ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              )}
              <p className="text-[12px] text-[var(--text-muted)]">
                Teammates open Settings → Plant team, paste the code, pick a role, and tap Join
                plant.
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
        <div className="mt-4 space-y-3">
          <p className="text-[13px] text-[var(--text-secondary)]">
            You are the plant owner. Create your team once — Vectra generates an invite code you
            share with ops, maintenance, and vendors.
          </p>
          <button
            type="button"
            disabled={creating}
            onClick={() => void handleCreateTeam()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:opacity-40"
          >
            {creating ? "Creating…" : "Create plant team & get invite code"}
          </button>
          <p className="text-[12px] text-[var(--text-muted)]">
            Uses plant name & site from workspace above ({user.plant || "My plant"} ·{" "}
            {user.plantSite || "Site not set"}). Save workspace first if you changed them.
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-[var(--border-subtle)] pt-4">
        <div className="text-[13px] font-medium">Join someone else&apos;s plant</div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="text-[12px] text-[var(--text-muted)]">Invite code</span>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
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
            disabled={joining || !joinCode.trim()}
            onClick={() => void handleJoin()}
            className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-[13px] hover:bg-[var(--bg-hover)] disabled:opacity-40"
          >
            {joining ? "Joining…" : "Join plant"}
          </button>
        </div>
        {message && (
          <div className="mt-2 space-y-2">
            <p
              className={`text-[12px] ${message.includes("not in Supabase") || message.includes("Could not") ? "text-amber-400" : "text-[var(--text-secondary)]"}`}
            >
              {message}
            </p>
            {(setupUrl || message.includes("not in Supabase")) && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[12px] text-[var(--text-secondary)]">
                <p className="font-medium text-amber-400">One-time database setup (2 min)</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>
                    Open{" "}
                    <a
                      href={
                        setupUrl ??
                        "https://supabase.com/dashboard/project/ahaousuahjwavkmaezdu/sql/new"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--accent)] underline"
                    >
                      Supabase SQL Editor
                    </a>
                  </li>
                  <li>
                    Copy{" "}
                    <a href="/setup-v2.sql" target="_blank" rel="noreferrer" className="text-[var(--accent)] underline">
                      setup-v2.sql
                    </a>{" "}
                    → paste → Run
                  </li>
                  <li>Return here and click Create plant team again</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
