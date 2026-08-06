"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Bell, Gauge, ShieldCheck, Zap } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { PLANT_NAME, kpis, ROI } from "@/lib/seed";

const FEED = [
  { icon: Bell, text: "AOI-01 · drift alert open on Line B", tone: "text-amber-400" },
  { icon: Activity, text: "Reflow-01 · ops brief ready for review", tone: "text-[var(--accent)]" },
  { icon: ShieldCheck, text: "REC-10480 · handoff sealed · integrity OK", tone: "text-emerald-400" },
];

function Sparkline() {
  return (
    <svg viewBox="0 0 120 32" className="h-8 w-full" aria-hidden>
      <motion.path
        d="M0 24 L12 20 L24 22 L36 14 L48 16 L60 10 L72 12 L84 8 L96 11 L108 6 L120 9"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.2, 0.6, 0.35, 1] }}
      />
      <motion.circle
        r="2.5"
        fill="var(--accent)"
        animate={{ cx: [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120], cy: [24, 20, 22, 14, 16, 10, 12, 8, 11, 6, 9] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

export function HeroLiveConsole() {
  const [tick, setTick] = useState(0);
  const [feedIndex, setFeedIndex] = useState(0);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setFeedIndex((i) => (i + 1) % FEED.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const update = () => {
      setClock(
        new Intl.DateTimeFormat("en-MY", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  const live = useMemo(() => {
    const wave = Math.sin(tick * 0.9);
    return {
      efficiency: +(kpis.productionEfficiency + wave * 0.35).toFixed(1),
      response: Math.max(14, Math.round(ROI.responseMinutes + wave * 2)),
      linesOnline: tick % 5 === 0 ? 5 : 6,
      energy: Math.round(kpis.energyCostToday + wave * 18),
    };
  }, [tick]);

  const feed = FEED[feedIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.65, ease: [0.2, 0.6, 0.35, 1] }}
      className="mt-12 w-full max-w-4xl"
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/85 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={22} />
            <div>
              <div className="text-[13px] font-medium">{PLANT_NAME}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live console
              </div>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="font-mono text-[11px] text-[var(--text-muted)]">{clock}</div>
            <div className="text-[10px] text-[var(--text-muted)]">MYT · shift board</div>
          </div>
        </div>

        <div className="grid gap-px bg-[var(--border-subtle)] sm:grid-cols-3">
          {[
            {
              icon: Gauge,
              label: "Line efficiency",
              value: live.efficiency,
              suffix: "%",
              decimals: 1,
            },
            {
              icon: Zap,
              label: "Avg response",
              value: live.response,
              suffix: " min",
              decimals: 0,
            },
            {
              icon: ShieldCheck,
              label: "Handoffs this week",
              value: ROI.signedHandoffsWeek,
              suffix: "",
              decimals: 0,
            },
          ].map((metric) => (
            <div key={metric.label} className="bg-[var(--bg-card)] px-4 py-4 sm:px-5">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <metric.icon className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.5} />
                {metric.label}
              </div>
              <div className="text-[26px] font-semibold tracking-tight">
                <AnimatedNumber
                  value={metric.value}
                  decimals={metric.decimals}
                  suffix={metric.suffix}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 border-t border-[var(--border-subtle)] p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5 sm:py-4">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
              Production trend · live
            </div>
            <Sparkline />
          </div>
          <div className="min-w-[200px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5">
            <div className="text-[10px] text-[var(--text-muted)]">Est. downtime cost today</div>
            <div className="mt-0.5 text-[18px] font-semibold tabular">
              <AnimatedNumber value={ROI.costTodayRm + (tick % 3) * 40} prefix="RM " />
            </div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">
              {live.linesOnline}/6 lines reporting
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <motion.div
            key={feedIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 text-[12px]"
          >
            <feed.icon className={`h-3.5 w-3.5 shrink-0 ${feed.tone}`} strokeWidth={1.5} />
            <span className="text-[var(--text-secondary)]">{feed.text}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
