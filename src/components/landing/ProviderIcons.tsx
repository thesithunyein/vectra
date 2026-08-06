"use client";

import Image from "next/image";
import { Mail } from "lucide-react";

const iconClass = "shrink-0 rounded-sm object-contain";

export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className={iconClass}>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l.1.1 6.2 5.2C39.2 37.1 44 32 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export function PhantomMark({ size = 20 }: { size?: number }) {
  return (
    <Image
      src="/phantom.svg"
      alt=""
      width={size}
      height={size}
      aria-hidden
      unoptimized
      className={`${iconClass} rounded-full`}
    />
  );
}

export function MetaMaskMark({ size = 20 }: { size?: number }) {
  return (
    <Image
      src="/metamask.svg"
      alt=""
      width={size}
      height={size}
      aria-hidden
      unoptimized
      className={iconClass}
    />
  );
}

export function EmailMark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Mail size={Math.round(size * 0.55)} strokeWidth={1.75} />
    </span>
  );
}

export function AuthProviderIcons({ size = 22 }: { size?: number }) {
  const items = [
    { key: "google", label: "Google sign-in", node: <GoogleMark size={size} /> },
    { key: "email", label: "Email sign-in", node: <EmailMark size={size} /> },
    { key: "phantom", label: "Phantom wallet", node: <PhantomMark size={size} /> },
    { key: "metamask", label: "MetaMask wallet", node: <MetaMaskMark size={size} /> },
  ];

  return (
    <div className="flex items-center justify-center gap-3" role="list" aria-label="Sign-in options">
      {items.map((item) => (
        <span
          key={item.key}
          role="listitem"
          title={item.label}
          className="inline-flex transition-transform duration-200 hover:scale-105"
        >
          {item.node}
        </span>
      ))}
    </div>
  );
}
