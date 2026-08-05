"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import clsx from "clsx";

export function KpiCard({
  label,
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delta,
  deltaLabel,
  positiveIsGood = true,
  icon: Icon,
}: {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delta: number;
  deltaLabel: string;
  positiveIsGood?: boolean;
  icon: LucideIcon;
}) {
  const good = positiveIsGood ? delta >= 0 : delta <= 0;
  const Arrow = delta >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="card hover:-translate-y-px p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[var(--text-secondary)]">{label}</p>
          <div className="mt-2 text-[32px] font-semibold tracking-tight">
            <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-soft">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={clsx(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-medium",
            good ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          )}
        >
          <Arrow className="h-3.5 w-3.5" />
          {Math.abs(delta)}
          {deltaLabel.includes("%") ? "" : ""}
        </span>
        <span className="text-[12px] text-[var(--text-muted)]">{deltaLabel}</span>
      </div>
    </div>
  );
}
