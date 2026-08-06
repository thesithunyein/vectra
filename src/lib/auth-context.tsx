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
import { userFromSupabase, userFromWallet, type AppUser } from "@/lib/auth";
import {
  loadWorkspace,
  saveWorkspace,
  type WorkspacePrefs,
} from "@/lib/workspace";
import {
  clearWalletSession,
  connectMetaMask,
  connectPhantom,
  disconnectWallet,
  loadWalletSession,
} from "@/lib/wallet";
import { fetchTenantInfo } from "@/lib/plant-cloud";
import { isCloudUserId } from "@/lib/plant-db";
import type { PlantRole, PlantTenant } from "@/lib/tenant-types";

type AuthContextValue = {
  session: Session | null;
  user: AppUser | null;
  ready: boolean;
  configured: boolean;
  tenant: PlantTenant | null;
  plantRole: PlantRole | null;
  readOnly: boolean;
  signOut: () => Promise<void>;
  updateWorkspace: (patch: Partial<WorkspacePrefs>) => void;
  refreshWorkspace: () => void;
  refreshTenant: () => Promise<void>;
  connectWallet: (provider: "phantom" | "metamask") => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(
  session: Session | null,
  walletAddress?: string | null
): AppUser | null {
  if (session?.user) {
    return userFromSupabase(
      session.user,
      loadWorkspace(session.user.id),
      walletAddress
    );
  }
  if (walletAddress) {
    return userFromWallet(walletAddress, loadWorkspace(`wallet:${walletAddress}`));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [tenant, setTenant] = useState<PlantTenant | null>(null);
  const [plantRole, setPlantRole] = useState<PlantRole | null>(null);
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

  const refreshTenant = useCallback(async () => {
    if (!session?.user?.id || !isCloudUserId(session.user.id)) {
      setTenant(null);
      setPlantRole(null);
      return;
    }
    const info = await fetchTenantInfo();
    setTenant(info?.tenant ?? null);
    setPlantRole(info?.role ?? null);
  }, [session?.user?.id]);

  const refreshWorkspace = useCallback(() => {
    setUser(mapUser(session, walletAddress));
  }, [session, walletAddress]);

  const updateWorkspace = useCallback(
    (patch: Partial<WorkspacePrefs>) => {
      const uid = session?.user?.id || (walletAddress ? `wallet:${walletAddress}` : null);
      if (!uid) return;
      saveWorkspace(uid, patch);
      setUser(mapUser(session, walletAddress));
    },
    [session, walletAddress]
  );

  const connectWallet = useCallback(
    async (provider: "phantom" | "metamask") => {
      const address =
        provider === "phantom" ? await connectPhantom() : await connectMetaMask();
      setWalletAddress(address);
      setUser(mapUser(session, address));
    },
    [session]
  );

  useEffect(() => {
    const existing = loadWalletSession();
    if (existing?.address) setWalletAddress(existing.address);

    if (!configured) {
      setReady(true);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      const wallet = loadWalletSession()?.address || null;
      setWalletAddress(wallet);
      setUser(mapUser(data.session, wallet));
      if (data.session?.user?.id && isCloudUserId(data.session.user.id)) {
        const info = await fetchTenantInfo();
        setTenant(info?.tenant ?? null);
        setPlantRole(info?.role ?? null);
      }
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      const wallet = loadWalletSession()?.address || null;
      setUser(mapUser(nextSession, wallet));
      if (nextSession?.user?.id && isCloudUserId(nextSession.user.id)) {
        void fetchTenantInfo().then((info) => {
          setTenant(info?.tenant ?? null);
          setPlantRole(info?.role ?? null);
        });
      } else {
        setTenant(null);
        setPlantRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!ready) return;
    if (session || walletAddress) return;
    if (pathname.startsWith("/login") || pathname === "/" || pathname.startsWith("/auth")) {
      return;
    }
    const next = encodeURIComponent(pathname);
    router.replace(`/login?next=${next}`);
  }, [ready, session, walletAddress, pathname, router]);

  const signOut = useCallback(async () => {
    if (configured) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    await disconnectWallet();
    clearWalletSession();
    setSession(null);
    setWalletAddress(null);
    setUser(null);
    setTenant(null);
    setPlantRole(null);
    router.replace("/login");
  }, [configured, router]);

  const readOnly = plantRole === "vendor";

  const value = useMemo(
    () => ({
      session,
      user,
      ready,
      configured,
      tenant,
      plantRole,
      readOnly,
      signOut,
      updateWorkspace,
      refreshWorkspace,
      refreshTenant,
      connectWallet,
    }),
    [
      session,
      user,
      ready,
      configured,
      tenant,
      plantRole,
      readOnly,
      signOut,
      updateWorkspace,
      refreshWorkspace,
      refreshTenant,
      connectWallet,
    ]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-[var(--text-muted)]">
        Loading workspace…
      </div>
    );
  }

  // Public auth gate only for routes that wrap AuthProvider (app shell).
  // Login page does not use AuthProvider.
  if (!session && !walletAddress) {
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
