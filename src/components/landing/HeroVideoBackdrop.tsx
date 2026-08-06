"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroVideoBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 420, 720], [1, 0.55, 0.15]);
  const scale = useTransform(scrollY, [0, 720], [1, 1.08]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => {
        /* autoplay blocked — poster remains visible */
      });
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("canplay", play, { once: true });

    return () => video.removeEventListener("canplay", play);
  }, [reduceMotion]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-x-0 top-0 h-[min(100vh,920px)] overflow-hidden">
      <motion.div style={{ opacity, scale }} className="absolute inset-0 origin-center">
        {reduceMotion ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url(/hero-montage-poster.jpg)" }}
          />
        ) : (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster="/hero-montage-poster.jpg"
            onLoadedData={() => setReady(true)}
            className={`h-full w-full object-cover transition-opacity duration-[1.4s] ease-out ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="/hero-montage.webm" type="video/webm" />
            <source src="/hero-montage.mp4" type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-[var(--bg-base)]/72 dark:bg-[#0a0a0b]/78" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)]/20 via-transparent to-[var(--bg-base)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/50 via-transparent to-[var(--bg-base)]/35" />
        <div className="hero-ambient-glow absolute -left-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-[var(--accent)]/20 blur-[100px]" />
        <div className="hero-ambient-glow-delay absolute -right-1/4 top-1/3 h-[360px] w-[360px] rounded-full bg-[#1e3a5f]/40 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.22] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </motion.div>
    </div>
  );
}
