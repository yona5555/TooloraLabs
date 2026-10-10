"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * Prime-factor towers: one column of cubes per input number (one cube per prime factor, counted
 * with multiplicity), then a GCF column and an LCM column. The cubes every number shares (the min
 * exponents) sit at the bottom, solid and outlined — exactly the GCF column; the translucent cubes
 * above are each number's own extra factors, and the LCM column stacks the max exponents.
 * Cubes drop in on every input change. Heavy (three + drei): imported ONLY through next/dynamic.
 */
export type GcfLcmTower = {
  /** Pill above the column, e.g. "12" or "GCF = 6". */
  label: string;
  kind: "number" | "gcf" | "lcm";
  /** Bottom → top: prime and whether this cube is part of the shared GCF core. */
  blocks: Array<{ prime: number; primeLabel: string; shared: boolean }>;
};

export type GcfLcmScene3DProps = {
  towers: GcfLcmTower[];
  /** Primes in ascending order; a prime's colour is fixed by its index here. */
  primes: number[];
  replay: number;
};

const DURATION = 1.4;
const ease = (t: number) => 1 - (1 - t) ** 3;

export default function GcfLcmScene3D({ towers, primes, replay }: GcfLcmScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const progress = useRef(0);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);

  const maxH = Math.max(1, ...towers.map((t) => t.blocks.length));
  const unit = Math.min(0.62, 3.4 / maxH);
  const gap = 0.95;
  const width = (towers.length - 1) * gap;
  const totalBlocks = towers.reduce((s, t) => s + t.blocks.length, 0);
  const showCubeLabels = totalBlocks <= 70 && unit >= 0.28;

  const flat = useMemo(() => {
    const out: Array<{ x: number; y: number; delay: number }> = [];
    towers.forEach((t, ti) =>
      t.blocks.forEach((_, bi) => out.push({ x: ti * gap - width / 2, y: unit / 2 + bi * unit * 1.04, delay: Math.min(0.6, bi * 0.06 + ti * 0.04) })),
    );
    return out;
  }, [towers, unit, width]);

  const key = JSON.stringify(towers.map((t) => t.blocks.map((b) => b.prime + (b.shared ? "s" : ""))));
  useEffect(() => {
    progress.current = 0;
    invalidate();
  }, [key, replay, invalidate]);

  useFrame((state, delta) => {
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / DURATION);
      state.invalidate();
    }
    flat.forEach((b, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const local = Math.max(0, Math.min(1, (progress.current - b.delay) / (1 - b.delay)));
      m.position.y = b.y + (1 - ease(local)) * 2.4;
    });
  });

  const colorOf = (prime: number) => p.faces[Math.max(0, primes.indexOf(prime)) % p.faces.length];
  const bg = p.dark ? "rgba(24,24,27,0.88)" : "rgba(255,255,255,0.94)";
  const pill = (text: string, color: string, size = 11) => (
    <span style={{ color, background: bg, border: `1px solid ${color}66`, borderRadius: 6, padding: "1px 6px", fontSize: size, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      {text}
    </span>
  );
  const towerColor = (k: GcfLcmTower["kind"]) => (k === "gcf" ? p.positive : k === "lcm" ? p.accent : p.text);
  const sharedEdge = p.dark ? "#f4f4f5" : "#0f172a";

  const offsets = towers.map((_, ti) => towers.slice(0, ti).reduce((s, t) => s + t.blocks.length, 0));
  const topY = (n: number) => unit / 2 + (n - 1) * unit * 1.04 + unit * 0.5;

  return (
    <group position={[0, -1.7, 0]}>
      {/* Floor plate */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[width + 1.2, 0.06, 1.3]} />
        <meshStandardMaterial color={p.grid} transparent opacity={0.6} />
      </mesh>
      {towers.map((t, ti) => {
        const x = ti * gap - width / 2;
        return (
          <group key={ti}>
            {t.blocks.map((b, bi) => {
              const i = offsets[ti] + bi;
              const c = colorOf(b.prime);
              const solid = b.shared || t.kind === "gcf";
              return (
                <mesh key={bi} ref={(m) => { meshes.current[i] = m; }} position={[x, unit / 2 + bi * unit * 1.04, 0]}>
                  <boxGeometry args={[unit * 0.94, unit, unit * 0.94]} />
                  <meshStandardMaterial color={c} transparent opacity={solid ? 0.95 : t.kind === "lcm" ? 0.7 : 0.38} depthWrite={solid} />
                  <Edges color={solid ? sharedEdge : c} threshold={15} />
                  {showCubeLabels && (
                    <Html position={[0, 0, unit * 0.5]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
                      <span style={{ color: p.dark ? "#fafafa" : "#0f172a", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace, Menlo, monospace" }}>{b.primeLabel}</span>
                    </Html>
                  )}
                </mesh>
              );
            })}
            <Html position={[x, topY(Math.max(1, t.blocks.length)) + 0.28, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
              {pill(t.label, towerColor(t.kind), t.kind === "number" ? 11 : 12)}
            </Html>
          </group>
        );
      })}
    </group>
  );
}
