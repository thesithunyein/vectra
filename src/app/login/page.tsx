"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CURRENT_USER, SESSION_KEY, createSession } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>(CURRENT_USER.email);
  const [password, setPassword] = useState("vectra-ops");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== CURRENT_USER.email) {
      setError("Use your Apex Precision work email to open this plant workspace.");
      return;
    }
    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }
    const session = createSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    const next = searchParams.get("next") || "/overview";
    router.replace(next.startsWith("/") ? next : "/overview");
  }

  return (
    <div className="card w-full max-w-md p-8">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/logo.svg" alt="Vectra" width={40} height={40} />
        <div>
          <div className="text-[16px] font-semibold">Vectra</div>
          <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
        </div>
      </div>

      <h1 className="text-[22px] font-semibold">Sign in to your plant</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {CURRENT_USER.plant} · {CURRENT_USER.plantSite}
      </p>

      <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
        <div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
          Signed in as
        </div>
        <div className="mt-1 text-[15px] font-medium">{CURRENT_USER.name}</div>
        <div className="text-[13px] text-[var(--text-secondary)]">
          {CURRENT_USER.role} · {CURRENT_USER.shift}
        </div>
        <div className="mt-1 font-mono text-[12px] text-[var(--accent)]">{CURRENT_USER.email}</div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Work email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
          />
        </div>
        {error && <p className="text-[12px] text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-[14px] font-medium text-white hover:brightness-110"
        >
          Sign in as {CURRENT_USER.name}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-[var(--text-muted)]">
        Live plant workspace for {CURRENT_USER.plant}. Not a public sample account.
      </p>
      <p className="mt-3 text-center text-[12px] text-[var(--text-muted)]">
        <Link href="/" className="hover:text-white">
          Back to home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div className="text-[13px] text-[var(--text-muted)]">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
