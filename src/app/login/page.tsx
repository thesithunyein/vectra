"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { connectMetaMask, connectPhantom } from "@/lib/wallet";

function oauthErrorMessage(raw: string | null) {
  if (!raw) return "";
  const text = decodeURIComponent(raw.replace(/\+/g, " "));
  if (/unable to exchange external code/i.test(text)) {
    return "Google sign-in failed: Supabase could not exchange Google’s code. Check Google Client ID/Secret and that the Google redirect URI is exactly https://ahaousuahjwavkmaezdu.supabase.co/auth/v1/callback";
  }
  return text;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/overview";
  const configured = useMemo(() => {
    try {
      return isSupabaseConfigured();
    } catch {
      return false;
    }
  }, []);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("error_description") || searchParams.get("error");
    if (fromQuery && fromQuery !== "auth") {
      setError(oauthErrorMessage(fromQuery));
      return;
    }
    if (typeof window === "undefined") return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const fromHash =
      hash.get("error_description") || hash.get("error_code") || hash.get("error");
    if (fromHash) {
      setError(oauthErrorMessage(fromHash));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
    if (searchParams.get("error") === "auth") {
      setError(
        "Google sign-in failed. Most common cause: wrong Google Client Secret in Supabase, or redirect URI not set to https://ahaousuahjwavkmaezdu.supabase.co/auth/v1/callback"
      );
    }
  }, [searchParams]);

  function redirectBase() {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${redirectBase()}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) setError(oauthError.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign in failed");
      setLoading(false);
    }
  }

  async function signInWithWallet(provider: "phantom" | "metamask") {
    setError("");
    setLoading(true);
    try {
      if (provider === "phantom") await connectPhantom();
      else await connectMetaMask();
      router.replace(next.startsWith("/") ? next : "/overview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connect failed");
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() || undefined },
            emailRedirectTo: `${redirectBase()}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        setMessage("Check your email to confirm your account, then sign in.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.replace(next.startsWith("/") ? next : "/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-3">
          <BrandLogo size={40} priority />
          <div>
            <div className="text-[16px] font-semibold">Vectra</div>
            <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
          </div>
        </div>
        <h1 className="text-[22px] font-semibold">Sign in to your plant</h1>
        <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
          Connect a wallet to enter. Google/email need Supabase env keys.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithWallet("phantom")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 text-[14px] font-medium hover:bg-[var(--bg-hover)] disabled:opacity-60"
        >
          <PhantomIcon />
          Connect Phantom
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithWallet("metamask")}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 text-[14px] font-medium hover:bg-[var(--bg-hover)] disabled:opacity-60"
        >
          <MetaMaskIcon />
          Connect MetaMask
        </button>
        {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -top-12 right-0">
        <ThemeToggle />
      </div>
      <div className="card w-full p-8">
        <div className="mb-8 flex items-center gap-3">
          <BrandLogo size={40} priority />
          <div>
            <div className="text-[16px] font-semibold">Vectra</div>
            <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
          </div>
        </div>

        <h1 className="text-[22px] font-semibold">
          {mode === "signin" ? "Sign in to your plant" : "Create your plant account"}
        </h1>

        <button
          type="button"
          disabled={loading}
          onClick={signInWithGoogle}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 text-[14px] font-medium hover:bg-[var(--bg-hover)] disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithWallet("phantom")}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 text-[14px] font-medium hover:bg-[var(--bg-hover)] disabled:opacity-60"
        >
          <PhantomIcon />
          Connect Phantom
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithWallet("metamask")}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2.5 text-[14px] font-medium hover:bg-[var(--bg-hover)] disabled:opacity-60"
        >
          <MetaMaskIcon />
          Connect MetaMask
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
          or email
          <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

        <form className="space-y-4" onSubmit={handleEmailAuth}>
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
            />
          </div>
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          {message && <p className="text-[12px] text-emerald-500">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-[14px] font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {loading
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in with email"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-[var(--text-muted)]">
          {mode === "signin" ? (
            <>
              New to Vectra?{" "}
              <button
                type="button"
                className="text-[var(--accent)]"
                onClick={() => setMode("signup")}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-[var(--accent)]"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
        <p className="mt-3 text-center text-[12px] text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text-primary)]">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

function PhantomIcon() {
  return (
    <Image
      src="/phantom.svg"
      alt=""
      width={20}
      height={20}
      aria-hidden
      unoptimized
      className="shrink-0 rounded-full"
    />
  );
}

function MetaMaskIcon() {
  return (
    <Image
      src="/metamask.svg"
      alt=""
      width={20}
      height={20}
      aria-hidden
      unoptimized
      className="shrink-0"
    />
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<div className="text-[13px] text-[var(--text-muted)]">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
