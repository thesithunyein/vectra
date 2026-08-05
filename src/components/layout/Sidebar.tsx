"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  Bell,
  BarChart3,
  Wrench,
  FileCheck,
  FileBarChart,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const nav = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Cpu },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/records", label: "Records", icon: FileCheck },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex items-center gap-3 px-5 py-5">
        <Image src="/logo.svg" alt="Vectra" width={36} height={36} priority />
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Vectra</div>
          <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors",
                active
                  ? "text-white"
                  : "text-[var(--text-secondary)] hover:bg-white/[0.03] hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-[var(--accent)] shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-[var(--text-secondary)] transition-colors hover:bg-white/[0.03] hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Log Out
        </Link>
      </div>
    </aside>
  );
}
