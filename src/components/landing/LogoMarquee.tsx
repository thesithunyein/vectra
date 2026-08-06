"use client";

import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";

function GoogleMark() {
  return (
    <svg width="72" height="24" viewBox="0 0 48 48" aria-hidden className="opacity-80">
      <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#34A853" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#FBBC05" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l.1.1 6.2 5.2C39.2 37.1 44 32 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function SolanaMark() {
  return (
    <svg width="96" height="24" viewBox="0 0 120 24" aria-hidden className="text-[var(--text-secondary)]">
      <text x="0" y="17" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="system-ui,sans-serif">
        Solana
      </text>
    </svg>
  );
}

function SupabaseMark() {
  return (
    <svg width="108" height="24" viewBox="0 0 130 24" aria-hidden className="text-[var(--text-secondary)]">
      <text x="0" y="17" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="system-ui,sans-serif">
        Supabase
      </text>
    </svg>
  );
}

function OpenAIMark() {
  return (
    <svg width="88" height="24" viewBox="0 0 100 24" aria-hidden className="text-[var(--text-secondary)]">
      <text x="0" y="17" fill="currentColor" fontSize="15" fontWeight="600" fontFamily="system-ui,sans-serif">
        OpenAI
      </text>
    </svg>
  );
}

const LOGOS = [
  { key: "vectra", node: <BrandLogo size={28} className="rounded-lg" /> },
  { key: "google", node: <GoogleMark /> },
  { key: "supabase", node: <SupabaseMark /> },
  { key: "openai", node: <OpenAIMark /> },
  { key: "solana", node: <SolanaMark /> },
  {
    key: "phantom",
    node: (
      <Image src="/phantom.svg" alt="" width={28} height={28} unoptimized className="rounded-full opacity-90" />
    ),
  },
  {
    key: "metamask",
    node: <Image src="/metamask.svg" alt="" width={28} height={28} unoptimized className="opacity-90" />,
  },
];

function LogoRow() {
  return (
    <>
      {LOGOS.map((logo) => (
        <div
          key={logo.key}
          className="flex shrink-0 items-center justify-center px-8 sm:px-10"
          aria-hidden
        >
          {logo.node}
        </div>
      ))}
    </>
  );
}

export function LogoMarquee() {
  return (
    <div className="marquee-mask relative mt-12 w-full max-w-5xl overflow-hidden">
      <div className="marquee-track flex w-max items-center py-2">
        <LogoRow />
        <LogoRow />
      </div>
    </div>
  );
}
