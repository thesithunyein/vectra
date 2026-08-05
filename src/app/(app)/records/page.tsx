"use client";

import { motion } from "framer-motion";
import { Bell, ShieldCheck, Wrench } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";

const STEPS = [
  {
    icon: Bell,
    title: "1. Early warning",
    body: "Baseline drift opens an alert with a clear reason — humans decide the next action.",
  },
  {
    icon: Wrench,
    title: "2. Close the job",
    body: "Maintenance closes downtime with a reason code. No spreadsheets or WhatsApp threads.",
  },
  {
    icon: ShieldCheck,
    title: "3. Signed handoff",
    body: "Closure seals under the signed-in user’s name. Night shift and vendors verify integrity here.",
  },
];

export default function RecordsPage() {
  const { records, usingSample } = useStore();

  return (
    <>
      <TopBar
        title="Records"
        subtitle="Signed handoffs for shift crews and vendors. Integrity checked."
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-medium">How it works</h3>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  Industrial 5.0 trust loop — human judgment, machine signal, durable record.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Integrity seal on every close
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                    <step.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="text-[13px] font-medium">{step.title}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-[var(--text-muted)]">
              Each seal binds maintenance ID, machine, reason, sealed-by name, and timestamp into an
              integrity fingerprint. If any field is altered, the check fails.
            </p>
          </div>

          {!usingSample && records.length === 0 && (
            <EmptyWorkspace
              title="No signed records yet"
              description="Closing a maintenance job seals a record under your name."
            />
          )}
          {(usingSample || records.length > 0) && (
            <div className="card overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Record ID</th>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Machine</th>
                    <th className="px-5 py-3 font-medium">Sealed by</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-mono text-[12px] text-[var(--accent)]">
                        {r.id}
                      </td>
                      <td className="px-5 py-4">{r.eventType}</td>
                      <td className="px-5 py-4 text-[var(--text-secondary)]">{r.deviceName}</td>
                      <td className="px-5 py-4">{r.sealedBy}</td>
                      <td className="px-5 py-4 text-[var(--text-secondary)] tabular">
                        {new Date(r.sealedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[12px] text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {r.integrityPassed ? "Integrity check passed" : "Failed"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  );
}
