"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * The percentage as a 10×10 board of 100 cubes (one cube = 1% of the base). Cubes inside the
 * share rise and turn blue; a fractional percent raises the next cube part-way; shares above
 * 100% stack a green second layer; a decrease marks the lost cubes red. Heights glide to their
 * new value whenever the inputs change.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type PercentageScene3DProps = {
  /** Share of the base shown on the board, in percent (0–200). */
  share: number;
  /** Mark cubes between the share and 100% as lost (a decrease). */
  loss: boolean;
  labels: { share: string; base: string };
};

const N = 10;
const GAP = 0.36;
const SIZE = 0.3;
const RISE = 0.9;
const FLAT = 0.06;

function targetHeights(share: number): number[] {
  const s = Math.min(Math.max(share, 0), 200);
  return Array.from({ length: 200 }, (_, i) => {
    const layer = i < 100 ? 0 : 1;
    const idx = i % 100;
    const filled = s - layer * 100;
    const frac = Math.min(Math.max(filled - idx, 0), 1);
    if (layer === 1) return frac * RISE;
    return FLAT + frac * (RISE - FLAT);
  });
}

export default function PercentageScene3D({ share, loss, labels }: PercentageScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const meshes = useRef<Array<Mesh | null>>([]);
  const heights = useRef<number[]>(targetHeights(0));
  const target = useMemo(() => targetHeights(share), [share]);

  useEffect(() => invalidate(), [target, invalidate]);

  useFrame(() => {
    let moving = false;
    for (let i = 0; i < 200; i++) {
      const h = heights.current[i];
      const next = h + (target[i] - h) * 0.18;
      const done = Math.abs(target[i] - next) < 0.002;
      heights.current[i] = done ? target[i] : next;
      if (!done) moving = true;
      const m = meshes.current[i];
      if (!m) continue;
      const hh = Math.max(heights.current[i], 0.0001);
      m.scale.y = hh;
      m.visible = i < 100 || hh > 0.002;
      const base = i < 100 ? 0 : RISE;
      m.position.y = base + hh / 2;
    }
    if (moving) invalidate();
  });

  const s = Math.min(Math.max(share, 0), 200);
  const pos = (idx: number): [number, number] => {
    const col = idx % N;
    const row = Math.floor(idx / N);
    return [(col - (N - 1) / 2) * GAP, (row - (N - 1) / 2) * GAP];
  };

  const color = (i: number) => {
    if (i >= 100) return p.positive;
    if (i < Math.ceil(Math.min(s, 100))) return p.primary;
    return loss ? p.danger : p.dark ? "#3f3f46" : "#e2e8f0";
  };

  const bg = p.dark ? "rgba(24,24,27,0.88)" : "rgba(255,255,255,0.94)";
  const pill = (text: string, c: string) => (
    <span
      style={{
        color: c,
        background: bg,
        border: `1px solid ${c}66`,
        borderRadius: 6,
        padding: "1px 6px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      {text}
    </span>
  );

  return (
    <group position={[0, -0.6, 0]}>
      {Array.from({ length: 200 }, (_, i) => {
        const [x, z] = pos(i % 100);
        return (
          <mesh
            key={i}
            ref={(el) => {
              meshes.current[i] = el;
            }}
            position={[x, FLAT / 2, z]}
            scale={[1, FLAT, 1]}
          >
            <boxGeometry args={[SIZE, 1, SIZE]} />
            <meshStandardMaterial color={color(i)} />
          </mesh>
        );
      })}
      <Html position={[0, RISE * (s > 100 ? 2 : 1) + 0.45, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        {pill(labels.share, s > 100 ? p.positive : p.primary)}
      </Html>
      <Html position={[0, -0.05, (N / 2) * GAP + 0.35]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        {pill(labels.base, p.muted)}
      </Html>
      <gridHelper args={[6, 12, p.grid, p.grid]} position={[0, -0.01, 0]} />
    </group>
  );
}
