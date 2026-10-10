"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * 100 unit cubes on a 10×10 tray, one per outcome out of 100 equally weighted trials, coloured by
 * the region it falls in (A∩B, A only, B only, neither). The cubes of the calculated event rise,
 * so the raised volume IS the answer. Heavy (three + drei): imported only through next/dynamic.
 */
export type ProbabilitySceneProps = {
  /** Cube counts for [A∩B, A only, B only, neither]; they sum to 100. */
  counts: [number, number, number, number];
  /** Which of the four regions belong to the calculated event. */
  target: [boolean, boolean, boolean, boolean];
  /** Pill text per region, plus the headline pill. */
  labels: [string, string, string, string];
  headline: string;
};

const N = 10;
const STEP = 0.5;
const SIZE = 0.42;
const LOW = 0.22;
const HIGH = 1.25;
const DURATION = 0.9;
const ease = (t: number) => 1 - (1 - t) ** 3;

export default function ProbabilityScene3D({ counts, target, labels, headline }: ProbabilitySceneProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const from = useRef<number[]>(Array(N * N).fill(LOW));
  const current = useRef<number[]>(Array(N * N).fill(LOW));
  const progress = useRef(1);

  // Region index of every cube, filled row by row so each region is one contiguous block.
  const regionOf = useMemo(() => {
    const out: number[] = [];
    counts.forEach((c, r) => {
      for (let i = 0; i < c; i++) out.push(r);
    });
    while (out.length < N * N) out.push(3);
    return out.slice(0, N * N);
  }, [counts]);

  const goal = useMemo(() => regionOf.map((r) => (target[r] ? HIGH : LOW)), [regionOf, target]);

  const key = `${counts.join(",")}|${target.join(",")}`;
  useEffect(() => {
    from.current = [...current.current];
    progress.current = 0;
    invalidate();
  }, [key, invalidate]);

  useFrame((state, delta) => {
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / DURATION);
      state.invalidate();
    }
    const e = ease(progress.current);
    for (let i = 0; i < N * N; i++) {
      const h = from.current[i] + (goal[i] - from.current[i]) * e;
      current.current[i] = h;
      const m = meshes.current[i];
      if (m) m.scale.set(SIZE, h, SIZE);
    }
  });

  const geom = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const colors = [p.accent, p.primary, p.positive, p.dark ? "#52525b" : "#cbd5e1"];
  const edge = p.dark ? "#18181b" : "#ffffff";
  const bg = p.dark ? "rgba(24,24,27,0.88)" : "rgba(255,255,255,0.94)";
  const half = ((N - 1) * STEP) / 2;

  const pill = (pos: [number, number, number], text: string, color: string, strong = false, key?: number) => (
    <Label3D key={key} position={pos} color={color} bg={bg} border={`${color}88`} text={text} fontSize={strong ? 12 : 11} weight={700} />
  );

  // Pill anchors: the centre cube of each non-empty region block, lifted above it.
  const anchors = counts.map((c, r) => {
    if (c === 0) return null;
    const start = counts.slice(0, r).reduce((a, v) => a + v, 0);
    const mid = start + Math.floor(c / 2);
    const x = (mid % N) * STEP - half;
    const z = Math.floor(mid / N) * STEP - half;
    return [x, (target[r] ? HIGH : LOW) + 0.35, z] as [number, number, number];
  });

  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[N * STEP + 0.3, N * STEP + 0.3]} />
        <meshStandardMaterial color={p.dark ? "#27272a" : "#e2e8f0"} />
      </mesh>
      {regionOf.map((r, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
            if (el) el.scale.set(SIZE, current.current[i], SIZE);
          }}
          geometry={geom}
          position={[(i % N) * STEP - half, 0, Math.floor(i / N) * STEP - half]}
        >
          <meshStandardMaterial color={colors[r]} transparent={!target[r]} opacity={target[r] ? 1 : 0.75} />
          <Edges color={edge} threshold={15} />
        </mesh>
      ))}
      {anchors.map((pos, r) =>
        pos ? (
          pill(pos, labels[r], r === 3 ? p.muted : colors[r], false, r)
        ) : null,
      )}
      {pill([0, HIGH + 1.1, -half], headline, p.text, true)}
    </group>
  );
}
