"use client";

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)]/95 px-3 py-2 text-[12px] shadow-xl backdrop-blur">
      {label && <div className="mb-1 text-[var(--text-muted)]">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 tabular">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[var(--text-secondary)]">{p.name}:</span>
          <span className="font-medium text-white">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
