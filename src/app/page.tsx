"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CircleHelp,
  ClipboardCheck,
  Factory,
  LogIn,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { HeroVideoBackdrop } from "@/components/landing/HeroVideoBackdrop";
import { AuthProviderIcons } from "@/components/landing/ProviderIcons";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const WORKFLOW = [
  {
    step: "01",
    icon: Bell,
    title: "Early warning fires",
    body: "Line telemetry drifts from baseline. Vectra opens an alert with machine, severity, and context — before shift-end surprises.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Context on every alert",
    body: "Each alert includes a plain-language brief: symptom, likely cause, and recommended next action. Supervisors review and assign — nothing closes automatically.",
  },
  {
    step: "03",
    icon: Wrench,
    title: "Maintenance closes the job",
    body: "Supervisor assigns work, adds a reason code, and closes downtime under their signed-in identity. No spreadsheet threads or disputed WhatsApp notes.",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Record sealed + attested",
    body: "Closure binds machine, reason, timestamp, and signer into an integrity fingerprint. The record is anchored so night shift and vendors can verify it was not altered after close.",
  },
];

const PERSONAS = [
  {
    icon: Factory,
    role: "Ops Lead",
    need: "See which line is drifting and act in minutes, not at month-end.",
  },
  {
    icon: Wrench,
    role: "Maintenance Supervisor",
    need: "Close jobs with reason codes and leave a record that survives shift change.",
  },
  {
    icon: Users,
    role: "Night shift & vendors",
    need: "One place to verify what happened — with an integrity seal, not chat screenshots.",
  },
];

const CAPABILITIES = [
  {
    label: "Live line monitoring",
    value: "Baseline drift alerts",
    detail: "Per machine, per shift",
  },
  {
    label: "Maintenance close-out",
    value: "Reason-coded jobs",
    detail: "Signed under your identity",
  },
  {
    label: "Shift handoffs",
    value: "Integrity records",
    detail: "Verifiable after close",
  },
  {
    label: "Plant visibility",
    value: "One console",
    detail: "Ops, maintenance, records",
  },
];

const FEATURE_ICONS = [
  { icon: Bell, label: "Alert briefs" },
  { icon: ClipboardCheck, label: "Signed handoffs" },
  { icon: ShieldCheck, label: "Integrity attest" },
];

const GET_STARTED = [
  "Create your plant account with Google, email, or wallet",
  "Set plant name, timezone, and team access in Settings",
  "Connect lines as telemetry comes online",
  "Close maintenance → signed record with integrity seal",
];

const FAQ = [
  {
    question: "What is Vectra?",
    answer:
      "Vectra is a live plant console for manufacturing teams. It connects early warnings, alert briefs, maintenance close-out, and signed shift handoffs in one workspace — built for floor ops, not generic BI dashboards.",
  },
  {
    question: "Do I need a crypto wallet?",
    answer:
      "No. Google and work email sign-in cover the full product. Phantom and MetaMask are available for teams that prefer wallet-based identity.",
  },
  {
    question: "How do alert briefs work?",
    answer:
      "When an alert opens, Vectra summarizes the signal context: symptom, likely cause, and recommended next action. Supervisors still assign, close, and sign every job — the brief speeds triage, it does not replace judgment.",
  },
  {
    question: "What is on-chain attestation?",
    answer:
      "When maintenance closes a job, Vectra seals a fingerprint of the record (machine, reason, signer, time). That hash is anchored for independent verification so night shift and vendors can confirm the handoff was not altered after close.",
  },
  {
    question: "When does my plant data appear?",
    answer:
      "Your workspace starts with your plant profile. Devices, alerts, and records populate as lines connect and your team works jobs — the console reflects live plant activity, not canned scenarios.",
  },
  {
    question: "Who is accountable for a closed record?",
    answer:
      "The signed-in user who closes maintenance. Their name, timestamp, and reason code bind to the record before the integrity seal and on-chain attestation.",
  },
];

function IconChip({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Bell;
  label: string;
  href?: string;
}) {
  const inner = (
    <span
      title={label}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 text-[var(--text-secondary)] shadow-[var(--shadow-card)] backdrop-blur-sm transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {inner}
      </Link>
    );
  }

  return inner;
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <HeroVideoBackdrop />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <BrandLogo size={36} priority />
          <div>
            <div className="text-[15px] font-semibold">Vectra</div>
            <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            aria-label="Sign in"
            title="Sign in"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]/70 text-[var(--text-secondary)] backdrop-blur-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="relative min-h-[calc(100vh-88px)] pb-16 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.2, 0.6, 0.35, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-2">
              <IconChip icon={Factory} label="Plant operations" />
              <IconChip icon={Wrench} label="Maintenance teams" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
              Downtime response and signed shift handoffs
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Vectra helps Ops Leads and Maintenance Supervisors act on line faults in minutes
              and leave signed records the night shift and vendors can trust.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {FEATURE_ICONS.map(({ icon, label }) => (
                <IconChip key={label} icon={icon} label={label} />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[14px] font-medium text-white shadow-lg shadow-[var(--accent-soft)] transition-all duration-200 hover:brightness-110"
              >
                Open console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                aria-label="How it works"
                title="How it works"
                className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)]/70 backdrop-blur-sm hover:bg-[var(--bg-hover)]"
              >
                <Route className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.2, 0.6, 0.35, 1] }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CAPABILITIES.map((s, index) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              className="card p-5 backdrop-blur-sm"
            >
              <div className="text-[12px] text-[var(--text-muted)]">{s.label}</div>
              <div className="mt-2 text-[22px] font-semibold leading-tight">{s.value}</div>
              <div className="mt-1 text-[12px] text-[var(--text-muted)]">{s.detail}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.section
          id="how-it-works"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.2, 0.6, 0.35, 1] }}
          className="mt-24 scroll-mt-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--accent)]">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                From drift signal to verifiable handoff
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
                One loop for the whole plant: detect early, decide fast, close with accountability,
                and leave proof the next shift can check.
              </p>
            </div>
            <IconChip icon={ShieldCheck} label="Shift-to-shift accountability" />
          </div>

          <div className="relative mt-10 grid gap-4 lg:grid-cols-2">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[var(--accent)] via-[var(--border-strong)] to-transparent lg:block" />
            {WORKFLOW.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -14 : 14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5, ease: [0.2, 0.6, 0.35, 1] }}
                className="card relative p-6 backdrop-blur-sm lg:pl-14"
              >
                <div className="absolute left-5 top-6 hidden h-3 w-3 rounded-full border-2 border-[var(--accent)] bg-[var(--bg-base)] lg:block" />
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-soft">
                    <step.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">{step.step}</span>
                </div>
                <h3 className="text-[15px] font-medium">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.2, 0.6, 0.35, 1] }}
          className="mt-20"
        >
          <h2 className="text-xl font-semibold">Built for the people on the floor</h2>
          <p className="mt-2 max-w-2xl text-[14px] text-[var(--text-secondary)]">
            Not another BI dashboard — a console shaped around how plants actually run shifts.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PERSONAS.map((persona, index) => (
              <motion.div
                key={persona.role}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="card p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)]">
                  <persona.icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-medium">{persona.role}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {persona.need}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.2, 0.6, 0.35, 1] }}
          className="mt-20 card overflow-hidden p-8 backdrop-blur-sm"
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-xl font-semibold">The problem plants face</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Downtime is found at shift end. Energy spikes hide until finance closes the month.
                Handoffs live in WhatsApp. Vendors dispute SLA claims with no single trusted record.
                Vectra gives each plant one live console for efficiency, energy, downtime, and
                signed maintenance handoffs.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <IconChip icon={Route} label="Getting started" />
              </div>
              <ol className="space-y-3">
                {GET_STARTED.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[13px] text-[var(--text-secondary)]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-mono text-[10px] text-[var(--accent)]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link
                href="/login"
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--accent)] hover:underline"
              >
                Open console
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.section
          id="faq"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.2, 0.6, 0.35, 1] }}
          className="mt-24 scroll-mt-24"
        >
          <div className="mb-8 max-w-2xl">
            <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--accent)]">
              FAQ
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Common questions</h2>
            <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
              How Vectra fits into daily plant operations, auth, and record integrity.
            </p>
          </div>
          <FaqAccordion items={FAQ} />
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.2, 0.6, 0.35, 1] }}
          className="mt-20 flex flex-col items-center rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-card)]/90 to-[var(--bg-elevated)]/90 px-8 py-12 text-center backdrop-blur-md"
        >
          <AuthProviderIcons size={24} />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">Run your plant on one console</h2>
          <p className="mt-3 max-w-lg text-[14px] text-[var(--text-secondary)]">
            Sign in to set up your workspace, connect lines as they come online, and close
            signed handoffs your next shift can verify.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:brightness-110"
          >
            Open Vectra console
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-[var(--border-subtle)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6">
          <BrandLogo size={20} />
          <div className="flex items-center gap-3">
            <a
              href="#how-it-works"
              aria-label="How it works"
              title="How it works"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            >
              <Route className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href="#faq"
              aria-label="FAQ"
              title="FAQ"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            >
              <CircleHelp className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <Link
              href="/login"
              aria-label="Sign in"
              title="Sign in"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            >
              <LogIn className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
