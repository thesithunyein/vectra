"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store";
import { ImportPlantData } from "@/components/settings/ImportPlantData";
import { ConnectLinePanel } from "@/components/settings/ConnectLinePanel";

export default function SettingsPage() {
  const { user, updateWorkspace } = useAuth();
  const { usingSample, hasPlantData, loadSamplePlant, clearPlantData } = useStore();
  const [plant, setPlant] = useState("");
  const [plantSite, setPlantSite] = useState("");
  const [shift, setShift] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPlant(user.plant);
    setPlantSite(user.plantSite);
    setShift(user.shift);
    setRole(user.role);
  }, [user]);

  if (!user) return null;

  function save() {
    updateWorkspace({
      plant: plant.trim() || "My plant",
      plantSite: plantSite.trim() || "Site not set",
      shift: shift.trim() || "Shift not set",
      role: role.trim() || "Member",
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <TopBar
        title="Settings"
        subtitle="Your workspace, profile, and plant identity."
      />
      <PageTransition>
        <div className="mx-auto max-w-2xl space-y-5 px-8 pb-10">
          <div className="card p-6">
            <h3 className="text-[15px] font-medium">Profile</h3>
            <div className="mt-4 flex items-center gap-4">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[16px] font-medium text-[var(--accent)]">
                  {user.initials}
                </div>
              )}
              <div>
                <div className="text-[14px] font-medium">{user.name}</div>
                <div className="text-[13px] text-[var(--text-secondary)]">{user.email}</div>
                {!user.avatarUrl && (
                  <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                    Profile photo appears when you sign in with Google.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="text-[15px] font-medium">Plant workspace</h3>
            <label className="block">
              <span className="text-[12px] text-[var(--text-muted)]">Plant name</span>
              <input
                value={plant}
                onChange={(e) => setPlant(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-[var(--text-muted)]">Site</span>
              <input
                value={plantSite}
                onChange={(e) => setPlantSite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[12px] text-[var(--text-muted)]">Shift</span>
                <input
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-[var(--text-muted)]">Your role</span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={save}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110"
            >
              {saved ? "Saved" : "Save workspace"}
            </button>
          </div>

          <ImportPlantData />

          <ConnectLinePanel />

          <div className="card p-6">
            <h3 className="text-[15px] font-medium">Example plant data</h3>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              Prefer a guided walkthrough? Load the built-in example plant to exercise alerts,
              maintenance, and signed records without preparing a CSV.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!usingSample ? (
                <button
                  type="button"
                  onClick={loadSamplePlant}
                  className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-[13px] hover:bg-[var(--bg-hover)]"
                >
                  Load example data
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearPlantData}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-[13px] text-red-400 hover:bg-red-500/10"
                >
                  Clear example data
                </button>
              )}
              {hasPlantData && !usingSample && (
                <button
                  type="button"
                  onClick={clearPlantData}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-[13px] text-red-400 hover:bg-red-500/10"
                >
                  Clear imported data
                </button>
              )}
            </div>
            {usingSample && (
              <p className="mt-3 text-[12px] text-amber-400">
                Example dataset active · clear anytime to return to an empty plant.
              </p>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
}
