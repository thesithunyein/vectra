"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition } from "@/components/motion/PageTransition";
import { useStore } from "@/lib/store";

export default function RecordsPage() {
  const { records } = useStore();

  return (
    <>
      <TopBar
        title="Records"
        subtitle="Signed handoffs for shift crews and vendors. Integrity checked."
      />
      <PageTransition>
        <div className="px-8 pb-10">
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
                    <td className="px-5 py-4 font-mono text-[12px] text-[var(--accent)]">{r.id}</td>
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
        </div>
      </PageTransition>
    </>
  );
}
