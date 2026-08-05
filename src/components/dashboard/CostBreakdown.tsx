"use client";

import { costBreakdown } from "@/lib/seed";
import { formatCurrency } from "@/lib/format";

export function CostBreakdown() {
  const total = costBreakdown.reduce((s, c) => s + c.value, 0);
  return (
    <div className="card flex h-full flex-col p-5">
      <h3 className="text-[15px] font-medium">Cost Breakdown</h3>
      <p className="mt-1 text-[28px] font-semibold tabular">{formatCurrency(total)}</p>
      <p className="text-[12px] text-[var(--text-muted)]">Total this period</p>
      <div className="mt-6 space-y-5">
        {costBreakdown.map((item) => (
          <div key={item.name}>
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className="text-[var(--text-secondary)]">{item.name}</span>
              <span className="tabular font-medium">
                {formatCurrency(item.value)} · {item.percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.percent}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
