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
import type { Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { userFromSupabase, type AppUser } from "@/lib/auth";
import {
  loadWorkspace,
  saveWorkspace,
  type WorkspacePrefs,
} from "@/lib/workspace";

type AuthContextValue = {
  session: Session | null;
  user: AppUser | null;
  ready: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
  updateWorkspace: (patch: Partial<WorkspacePrefs>) => void;
  refreshWorkspace: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(session: Session | null): AppUser | null {
  if (!session?.user) return null;
  return userFromSupabase(session.user, loadWorkspace(session.user.id));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [configured] = useState(() => {
    try {
      return isSupabaseConfigured();
    } catch {
      return false;
    }
  });
  const router = useRouter();
  const pathname = usePathname();

  const refreshWorkspace = useCallback(() => {
    setUser(mapUser(session));
  }, [session]);

  const updateWorkspace = useCallback(
    (patch: Partial<WorkspacePrefs>) => {
      if (!session?.user) return;
      saveWorkspace(session.user.id, patch);
      setUser(userFromSupabase(session.user, loadWorkspace(session.user.id)));
    },
    [session]
  );

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(mapUser(data.session));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(mapUser(nextSession));
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!ready) return;
    if (!configured) return;
    if (!session) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [ready, session, pathname, router, configured]);

  const signOut = useCallback(async () => {
    if (configured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    router.replace("/login");
  }, [configured, router]);

  const value = useMemo(
    () => ({
      session,
      user,
      ready,
      configured,
      signOut,
      updateWorkspace,
      refreshWorkspace,
    }),
    [session, user, ready, configured, signOut, updateWorkspace, refreshWorkspace]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-[var(--text-muted)]">
        Loading workspace…
      </div>
    );
  }

  if (!configured) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <div className="card max-w-md p-8">
            <h1 className="text-[18px] font-semibold">Connect Supabase to enable sign in</h1>
            <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.
            </p>
            <a href="/login" className="mt-4 inline-block text-[13px] text-[var(--accent)]">
              Open sign in page
            </a>
          </div>
        </div>
      </AuthContext.Provider>
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
