"use client";
import { useState, type SyntheticEvent } from "react";
import { SurfaceAreaLive3DLive } from "./SurfaceAreaLive3D";
import SurfaceAreaMobileRow from "./SurfaceAreaMobileRow";

/**
 * Phone standard point 7 (<768px, 2026-10-22, this tool only): the 3D scene is the one explicitly
 * named "heavy" piece on this page (three.js/@react-three/fiber, already its own dynamic chunk in
 * SurfaceAreaLive3D.tsx) — it must not mount at all until this row is actually opened, not just
 * stay visually hidden. The native `<details>`'s own `onToggle` event (fired on both open and
 * close) is enough to know that; no observer or extra library needed. Once opened it stays
 * mounted even after closing, same as any ordinary lazy-mount-on-first-open pattern.
 */
export default function SurfaceAreaMobile3DRow({ title }: { title: string }) {
  const [opened, setOpened] = useState(false);

  function handleToggle(e: SyntheticEvent<HTMLDetailsElement>) {
    if (e.currentTarget.open) setOpened(true);
  }

  return (
    <SurfaceAreaMobileRow title={title} onToggle={handleToggle}>
      {opened && <SurfaceAreaLive3DLive />}
    </SurfaceAreaMobileRow>
  );
}
