"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--bg-hover)]"
              aria-expanded={open}
            >
              <span className="text-[14px] font-medium leading-snug">{item.question}</span>
              <ChevronDown
                className={clsx(
                  "mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200",
                  open && "rotate-180",
                )}
                strokeWidth={1.5}
              />
            </button>
            <div
              className={clsx(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
