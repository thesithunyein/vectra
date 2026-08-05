"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function Toast() {
  const { toast, clearToast } = useStore();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 4000);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -12, x: 8 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed right-6 top-6 z-50 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] px-4 py-3 text-[13px] shadow-2xl"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
