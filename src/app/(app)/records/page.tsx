"use client";

import { motion } from "framer-motion";
import { ExternalLink, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";

const STEPS = [
  {
    icon: Sparkles,
    title: "1. AI brief",
    body: "Early warning opens an alert. AI drafts what’s wrong and the next action — humans decide.",
  },
  {
    icon: Wrench,
    title: "2. Close the job",
    body: "Maintenance closes downtime with a reason code under the signed-in user’s name.",
  },
  {
    icon: ShieldCheck,
    title: "3. Seal + attest",
    body: "Integrity fingerprint is checked locally, then anchored on Solana so night shift can verify.",
  },
];

export default function RecordsPage() {
  const { records, hasPlantData } = useStore();

  return (
    <>
      <TopBar
        title="Records"
        subtitle="Signed handoffs with integrity seals and optional on-chain attestation."
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-medium">How it works</h3>
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  Industrial 5.0 · AI assists · Web3 attests · humans stay in control.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Integrity + Solana memo
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
              Each close binds maintenance ID, machine, reason, sealed-by, and time into a fingerprint.
              The hash is written to a Solana memo transaction for public verification.
            </p>
          </div>

          {!hasPlantData && (
            <EmptyWorkspace
              title="No signed records yet"
              description="Close a maintenance job to seal a record under your name and attest on-chain."
            />
          )}
          {hasPlantData && (
            <div className="card overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Record ID</th>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Machine</th>
                    <th className="px-5 py-3 font-medium">Sealed by</th>
                    <th className="px-5 py-3 font-medium">Integrity</th>
                    <th className="px-5 py-3 font-medium">On-chain</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-[13px] text-[var(--text-muted)]">
                        No records yet. Close a maintenance job in Maintenance to seal your first
                        handoff.
                      </td>
                    </tr>
                  )}
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
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[12px] text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {r.integrityPassed ? "Passed" : "Failed"}
                          </span>
                          {r.integrityHash && (
                            <div className="font-mono text-[10px] text-[var(--text-muted)]">
                              {r.integrityHash}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {r.chainExplorerUrl ? (
                          <a
                            href={r.chainExplorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] text-[var(--accent)] hover:underline"
                          >
                            View proof
                            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                          </a>
                        ) : (
                          <span className="text-[12px] text-[var(--text-muted)]">Local only</span>
                        )}
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
