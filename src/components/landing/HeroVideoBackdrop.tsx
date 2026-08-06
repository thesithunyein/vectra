"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroVideoBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 480, 800], [1, 0.5, 0.12]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.06]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => undefined);
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("canplay", play, { once: true });

    return () => video.removeEventListener("canplay", play);
  }, [reduceMotion]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(100vh,960px)] overflow-hidden">
      <motion.div style={{ opacity, scale }} className="absolute inset-0 origin-center">
        {reduceMotion ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url(/hero-bg-poster.jpg)" }}
          />
        ) : (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster="/hero-bg-poster.jpg"
            onLoadedData={() => setReady(true)}
            className={`h-full w-full object-cover transition-opacity duration-[1.2s] ease-out ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-[var(--bg-base)]/70 dark:bg-[#0a0a0b]/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)]/25 via-transparent to-[var(--bg-base)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/45 via-transparent to-[var(--bg-base)]/30" />
      </motion.div>
    </div>
  );
}
