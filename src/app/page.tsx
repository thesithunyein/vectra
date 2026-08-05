"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Bell, Wrench } from "lucide-react";
import { ROI } from "@/lib/seed";
import { formatRm } from "@/lib/format";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Vectra" width={36} height={36} />
          <div>
            <div className="text-[15px] font-semibold">Vectra</div>
            <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
          </div>
        </div>
        <Link
          href="/login"
          className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-[13px] hover:bg-white/[0.04]"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-[13px] font-medium text-[var(--accent)]">
            For manufacturing plants · No wallet steps
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Downtime response and signed shift handoffs
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--text-secondary)]">
            Vectra helps Ops Leads and Maintenance Supervisors act on line faults in minutes
            and leave signed records the night shift and vendors can trust.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[14px] font-medium text-white hover:brightness-110"
            >
              Open console
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/analytics"
              className="rounded-lg border border-[var(--border-subtle)] px-5 py-2.5 text-[14px] hover:bg-white/[0.04]"
            >
              View analytics
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Unplanned downtime today", value: `${ROI.downtimeHours} hrs` },
            { label: "Est. cost today", value: formatRm(ROI.costTodayRm) },
            { label: "Avg response time", value: `${ROI.responseMinutes} min` },
            { label: "Signed handoffs this week", value: String(ROI.signedHandoffsWeek) },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <div className="text-[12px] text-[var(--text-muted)]">{s.label}</div>
              <div className="mt-2 text-[28px] font-semibold tabular">{s.value}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Bell,
                title: "Early warning",
                body: "Drift from each line baseline creates an alert with a clear reason and next action.",
              },
              {
                icon: Wrench,
                title: "Close the job",
                body: "Maintenance closes downtime with a reason code. No spreadsheets. No WhatsApp arguments.",
              },
              {
                icon: ShieldCheck,
                title: "Signed record sticks",
                body: "Critical closures become signed records. Night shift verifies integrity in one place.",
              },
            ].map((step) => (
              <div key={step.title} className="card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl accent-soft">
                  <step.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-medium">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 card p-8"
        >
          <h2 className="text-xl font-semibold">The problem plants face</h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
            Downtime is found at shift end. Energy spikes hide until finance closes the month.
            Handoffs live in WhatsApp. Vendors dispute SLA claims with no single trusted record.
            Vectra gives Apex Precision one live console for efficiency, energy, downtime, and
            signed maintenance handoffs.
          </p>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-[var(--border-subtle)] py-8 text-center text-[12px] text-[var(--text-muted)]">
        Vectra · Industrial Monitoring · Built for manufacturing teams
      </footer>
    </div>
  );
}
