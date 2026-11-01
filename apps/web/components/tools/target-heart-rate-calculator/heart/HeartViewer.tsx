"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { useMotionAllowed, useMotionEpisode } from "@/components/tool-ui/motion/motion";
import HeartSvg from "./HeartSvg";

// three/fiber/drei live only in this dynamically imported chunk, never in the page chunk.
const AnatomicalHeartCanvas = dynamic(() => import("./AnatomicalHeartCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-gradient-to-br from-rose-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />,
});

export type HeartLabels = { bpm: string; pct: string; max: string };

let webgl: boolean | undefined;
function hasWebGL(): boolean {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const noop = () => () => {};
const RM = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia?.(RM);
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
}

function subscribeVisible(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

/**
 * Realistic anatomical heart at the target BPM. The 3D chunk loads only when the card nears the viewport. It
 * beats only during a motion episode (tool-ui/motion): when the target BPM changes, never on load, never off
 * screen, with the page hidden or under prefers-reduced-motion. Labels are HTML overlays (page text, so every
 * locale shapes correctly). No WebGL → detailed 2D SVG heart.
 */
export default function HeartViewer({ bpm, color, labels }: { bpm: number; color: string; labels: HeartLabels }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = usePalette3D();
  const [near, setNear] = useState(false);
  const gl = useSyncExternalStore<boolean | null>(noop, hasWebGL, () => null);
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia?.(RM).matches ?? false, () => false);
  const beat = useMotionEpisode([bpm]);
  const allowed = useMotionAllowed(ref);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pill = "pointer-events-none absolute z-10 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold whitespace-nowrap shadow-sm backdrop-blur-sm";
  const surface = "border-zinc-300/70 bg-white/85 dark:border-zinc-600/70 dark:bg-zinc-900/80";

  return (
    <div
      ref={ref}
      dir="ltr"
      data-heart-viewer
      className="relative h-full min-h-[280px] w-full cursor-grab touch-none overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_42%,#ffffff_0%,#f1f5f9_55%,#e2e8f0_100%)] active:cursor-grabbing dark:bg-[radial-gradient(ellipse_at_50%_42%,#2a2a31_0%,#1c1c21_55%,#141417_100%)]"
    >
      {gl === false ? (
        <HeartSvg bpm={bpm} reduced={reduced} paused={!(beat.active && allowed)} />
      ) : near && gl ? (
        <AnatomicalHeartCanvas bpm={bpm} beating={beat.active} dark={p.dark} />
      ) : null}
      <span className={`${pill} start-1/2 top-2 -translate-x-1/2 text-xs font-extrabold text-zinc-900 dark:text-zinc-50`} style={{ borderColor: color, backgroundColor: p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.9)", boxShadow: `inset 0 -2px 0 ${color}` }}>
        {labels.bpm}
      </span>
      <span className={`${pill} ${surface} end-2 top-1/3 text-blue-700 dark:text-blue-300`}>{labels.max}</span>
      <span className={`${pill} ${surface} bottom-2 start-1/2 -translate-x-1/2 text-zinc-600 dark:text-zinc-300`}>{labels.pct}</span>
    </div>
  );
}
