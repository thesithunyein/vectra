"use client";

import Link from "next/link";
import { Factory, Upload } from "lucide-react";
import { useStore } from "@/lib/store";

export function EmptyWorkspace({
  title = "No plant data yet",
  description = "Import a CSV from Settings, or load example data to walk through the ops loop.",
}: {
  title?: string;
  description?: string;
}) {
  const { usingSample, loadSamplePlant } = useStore();

  if (usingSample) return null;

  return (
    <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Factory className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-[15px] font-medium">{title}</h3>
          <p className="mt-1 max-w-lg text-[13px] text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:brightness-110"
        >
          <Upload className="h-4 w-4" strokeWidth={1.5} />
          Import CSV
        </Link>
        <button
          type="button"
          onClick={loadSamplePlant}
          className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-2 text-[13px] font-medium hover:bg-[var(--bg-hover)]"
        >
          Load example data
        </button>
      </div>
    </div>
  );
}
