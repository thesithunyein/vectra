"use client";

import Image from "next/image";
import clsx from "clsx";
import { BrandLogo } from "@/components/BrandLogo";

type LogoAsset = {
  key: string;
  dark: string;
  light?: string;
  width: number;
  height: number;
  className?: string;
  invertOnDark?: boolean;
  shared?: boolean;
};

const LOGOS: LogoAsset[] = [
  {
    key: "google",
    dark: "/logos/google.svg",
    width: 72,
    height: 24,
    shared: true,
  },
  {
    key: "supabase",
    dark: "/logos/supabase.svg",
    light: "/logos/supabase-light.svg",
    width: 96,
    height: 22,
  },
  {
    key: "openai",
    dark: "/logos/openai.svg",
    light: "/logos/openai.svg",
    width: 88,
    height: 24,
    invertOnDark: true,
  },
  {
    key: "solana",
    dark: "/logos/solana.svg",
    light: "/logos/solana-light.svg",
    width: 28,
    height: 28,
    className: "rounded-sm",
  },
  {
    key: "phantom",
    dark: "/phantom.svg",
    width: 28,
    height: 28,
    className: "rounded-full",
    shared: true,
  },
  {
    key: "metamask",
    dark: "/metamask.svg",
    width: 28,
    height: 28,
    shared: true,
  },
];

function MarqueeLogo({ logo }: { logo: LogoAsset }) {
  const lightSrc = logo.light ?? logo.dark;

  if (logo.shared) {
    return (
      <div className="relative flex h-7 items-center" style={{ width: logo.width }}>
        <Image
          src={logo.dark}
          alt=""
          width={logo.width}
          height={logo.height}
          aria-hidden
          unoptimized
          className={clsx(
            "marquee-logo marquee-logo--shared absolute left-0 top-1/2 -translate-y-1/2 object-contain",
            logo.className,
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-7 items-center" style={{ width: logo.width }}>
      <Image
        src={logo.dark}
        alt=""
        width={logo.width}
        height={logo.height}
        aria-hidden
        unoptimized
        className={clsx(
          "marquee-logo marquee-logo--dark absolute left-0 top-1/2 -translate-y-1/2 object-contain",
          logo.className,
          logo.invertOnDark && "marquee-logo-invert",
        )}
      />
      <Image
        src={lightSrc}
        alt=""
        width={logo.width}
        height={logo.height}
        aria-hidden
        unoptimized
        className={clsx(
          "marquee-logo marquee-logo--light absolute left-0 top-1/2 -translate-y-1/2 object-contain",
          logo.className,
        )}
      />
    </div>
  );
}

function LogoRow({ rowKey }: { rowKey: string }) {
  return (
    <>
      <div className="flex shrink-0 items-center px-8 sm:px-10">
        <BrandLogo size={28} className="rounded-lg" />
      </div>
      {LOGOS.map((logo) => (
        <div key={`${rowKey}-${logo.key}`} className="flex shrink-0 items-center px-8 sm:px-10">
          <MarqueeLogo logo={logo} />
        </div>
      ))}
    </>
  );
}

export function LogoMarquee() {
  return (
    <div className="marquee-mask relative mt-12 w-full max-w-5xl overflow-hidden">
      <div className="marquee-track flex w-max items-center py-2">
        <LogoRow rowKey="a" />
        <LogoRow rowKey="b" />
      </div>
    </div>
  );
}
