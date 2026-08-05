"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/logo.svg" alt="Vectra" width={40} height={40} />
          <div>
            <div className="text-[16px] font-semibold">Vectra</div>
            <div className="text-[12px] text-[var(--text-muted)]">Industrial Monitoring</div>
          </div>
        </div>
        <h1 className="text-[22px] font-semibold">Sign in</h1>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Apex Precision · Shah Alam
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/overview");
          }}
        >
          <div>
            <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Email</label>
            <input
              type="email"
              defaultValue="farah@apex-precision.my"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] text-[var(--text-muted)]">Password</label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[14px] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-[14px] font-medium text-white hover:brightness-110"
          >
            Continue as Ops Lead (Apex Precision)
          </button>
        </form>
        <p className="mt-6 text-center text-[12px] text-[var(--text-muted)]">
          <Link href="/" className="hover:text-white">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
