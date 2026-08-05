"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CURRENT_USER,
  SESSION_KEY,
  createSession,
  type Session,
} from "@/lib/auth";

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!session && pathname !== "/login") {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [ready, session, pathname, router]);

  const signIn = useCallback(() => {
    const nextSession = createSession();
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ session, ready, signIn, signOut }),
    [session, ready, signIn, signOut]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-[var(--text-muted)]">
        Loading workspace…
      </div>
    );
  }

  if (!session) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex min-h-screen items-center justify-center text-[13px] text-[var(--text-muted)]">
          Redirecting to sign in…
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useCurrentUser() {
  return CURRENT_USER;
}
