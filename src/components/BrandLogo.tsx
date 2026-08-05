"use client";

import Image from "next/image";
import clsx from "clsx";

export function BrandLogo({
  size = 36,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Vectra"
      width={size}
      height={size}
      priority={priority}
      className={clsx("rounded-[10px] shadow-sm", className)}
    />
  );
}
