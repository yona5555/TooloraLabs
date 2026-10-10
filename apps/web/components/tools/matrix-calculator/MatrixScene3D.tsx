"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Edges, Html, Line } from "@react-three/drei";
import type { Mat2 } from "@tooloralabs/tools";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * The unit cube (and a 5×5 lattice in its base plane) carried by the 2x2 matrix embedded as
 * [[a11, a12, 0], [a21, a22, 0], [0, 0, 1]]: the whole group's world matrix is blended from the
 * identity to that map, so the ghost cube morphs into the parallelepiped whose volume is |det A|.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type MatrixScene3DProps = {
  m: Mat2;
  /** Changing this number replays the identity → A animation. */
  replay: number;
  labels: { i: string; j: string; k: string; volume: string };
};

type V3 = [number, number, number];
const DURATION = 1.6;
const LATTICE = [-1, -0.5, 0, 0.5, 1, 1.5, 2];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function setBlend(target: THREE.Matrix4, m: Mat2, t: number) {
  const a = 1 + (m[0] - 1) * t;
  const b = m[1] * t;
  const c = m[2] * t;
  const d = 1 + (m[3] - 1) * t;
  // Math x → three x, math y → three y (up), the third basis vector k̂ → three z (depth).
  target.set(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
}

export default function MatrixScene3D({ m, replay, labels }: MatrixScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<THREE.Group>(null);
  const progress = useRef(0);

  // Fit: the transformed lattice square [-1, 2]² decides one uniform scale; its centre (the image
  // of the cube's centre) sits at the origin so orbiting pivots around the solid.
  const { k, centre } = useMemo(() => {
    const corners: Array<[number, number]> = [[-1, -1], [2, -1], [-1, 2], [2, 2]];
    const ext = Math.max(2, ...corners.flatMap(([x, y]) => [Math.abs(m[0] * x + m[1] * y - (m[0] + m[1]) / 2), Math.abs(m[2] * x + m[3] * y - (m[2] + m[3]) / 2)]));
    const scale = 2.9 / ext;
    return { k: scale, centre: [-((m[0] + m[1]) / 2) * scale, -((m[2] + m[3]) / 2) * scale, -0.5 * scale] as V3 };
  }, [m]);

  const key = m.join(",");
  useEffect(() => {
    progress.current = 0;
    invalidate();
  }, [key, replay, invalidate]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + delta / DURATION);
      state.invalidate();
    }
    setBlend(g.matrix, m, ease(progress.current));
    g.matrixWorldNeedsUpdate = true;
  });

  const cubeGeom = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0.5, 0.5, 0.5), []);
  const latticeColor = p.dark ? "#52525b" : "#94a3b8";
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const pill = (text: string, color: string) => (
    <span style={{ color, background: bg, border: `1px solid ${color}66`, borderRadius: 6, padding: "1px 6px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      {text}
    </span>
  );
  const iColor = p.danger;
  const jColor = p.positive;
  const kColor = p.accent;
  const det = m[0] * m[3] - m[1] * m[2];
  const solidColor = det < 0 ? p.warning : p.primary;
  const O: V3 = [0, 0, 0];

  return (
    <group scale={k} position={centre}>
      {/* Ghost of the original unit cube, never transformed. */}
      <mesh geometry={cubeGeom}>
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges color={p.muted} threshold={15} />
      </mesh>

      <group ref={group} matrixAutoUpdate={false}>
        {LATTICE.map((v) => (
          <group key={v}>
            <Line points={[[v, -1, 0], [v, 2, 0]]} color={latticeColor} lineWidth={v === 0 ? 1.6 : 0.8} transparent opacity={0.7} />
            <Line points={[[-1, v, 0], [2, v, 0]]} color={latticeColor} lineWidth={v === 0 ? 1.6 : 0.8} transparent opacity={0.7} />
          </group>
        ))}
        <mesh geometry={cubeGeom}>
          <meshStandardMaterial color={solidColor} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
          <Edges color={p.dark ? "#e4e4e7" : "#1e3a8a"} threshold={15} />
        </mesh>
        <Line points={[O, [1, 0, 0]]} color={iColor} lineWidth={4} />
        <Line points={[O, [0, 1, 0]]} color={jColor} lineWidth={4} />
        <Line points={[O, [0, 0, 1]]} color={kColor} lineWidth={4} />
        <Html position={[1.08, 0, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          {pill(labels.i, iColor)}
        </Html>
        <Html position={[0, 1.1, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          {pill(labels.j, jColor)}
        </Html>
        <Html position={[0, 0, 1.15]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          {pill(labels.k, kColor)}
        </Html>
        <Html position={[0.5, 0.5, 1.05]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          {pill(labels.volume, solidColor)}
        </Html>
      </group>
    </group>
  );
}
