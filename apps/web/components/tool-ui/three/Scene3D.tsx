"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Scene3DCanvasProps } from "./Scene3DCanvas";

function Fallback() {
  return <div className="h-full w-full animate-pulse rounded-xl bg-gradient-to-br from-blue-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />;
}

const Scene3DCanvas = dynamic(() => import("./Scene3DCanvas"), { ssr: false, loading: Fallback });

/**
 * Lazy, client-only 3D scene: three/fiber/drei are split into their own
 * chunk and only fetched once the card scrolls near the viewport, so page
 * load is unaffected. Children are fiber elements (meshes, drei Text/Html…);
 * import drei/three in the scene file only, never at page level.
 */
export default function Scene3D({ className = "", ...props }: Scene3DCanvasProps & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  return (
    <div ref={ref} dir="ltr" className={`relative h-full min-h-[280px] w-full cursor-grab touch-none overflow-hidden rounded-xl active:cursor-grabbing ${className}`}>
      {visible ? <Scene3DCanvas {...props} /> : <Fallback />}
    </div>
  );
}
