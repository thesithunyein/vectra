"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        className ??
        "rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      }
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
      )}
    </button>
  );
}
