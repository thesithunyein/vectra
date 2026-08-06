export type WalletSession = {
  address: string;
  connectedAt: string;
};

const STORAGE_KEY = "vectra_wallet_session";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      publicKey?: { toBase58: () => string } | null;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{
        publicKey: { toBase58: () => string };
      }>;
      disconnect: () => Promise<void>;
      on?: (event: string, handler: () => void) => void;
      off?: (event: string, handler: () => void) => void;
    };
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function loadWalletSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WalletSession;
  } catch {
    return null;
  }
}

export function saveWalletSession(address: string): WalletSession {
  const session: WalletSession = {
    address,
    connectedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearWalletSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function shortAddress(address: string) {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export async function connectPhantom(): Promise<string> {
  const provider = window.solana;
  if (!provider?.isPhantom) {
    throw new Error("Phantom wallet not found. Install Phantom for Solana, then try again.");
  }
  const res = await provider.connect();
  const address = res.publicKey.toBase58();
  saveWalletSession(address);
  return address;
}

export async function connectMetaMask(): Promise<string> {
  const eth = window.ethereum;
  if (!eth?.isMetaMask) {
    throw new Error("MetaMask not found. Install MetaMask, then try again.");
  }
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts?.[0];
  if (!address) throw new Error("No MetaMask account returned.");
  saveWalletSession(address);
  return address;
}

export async function disconnectWallet() {
  try {
    if (window.solana?.isPhantom) {
      await window.solana.disconnect();
    }
  } catch {
    // ignore
  }
  clearWalletSession();
}
