"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Edges, Html, Line } from "@react-three/drei";
import type { Pt } from "@tooloralabs/tools";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * The plane shape as an extruded slab with its unit-square grid on top and labeled dimensions.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 * All inputs are in real units (shape centered on its bounding box, y up); the scene rescales.
 */
export type AreaScene3DProps = {
  outline: Pt[];
  grid: Array<[Pt, Pt]>;
  dims: Array<{ from: Pt; to: Pt; text: string; offset?: Pt }>;
  /** Optional label at a point, e.g. the sector angle. */
  marks?: Array<{ at: Pt; text: string }>;
  areaLabel: string;
};

const FIT = 3.6;
const DEPTH = 0.28;

export default function AreaScene3D({ outline, grid, dims, marks = [], areaLabel }: AreaScene3DProps) {
  const p = usePalette3D();
  const xs = outline.map((q) => q[0]);
  const ys = outline.map((q) => q[1]);
  const k = FIT / Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1e-9);
  const top = DEPTH + 0.004;
  const to3 = (q: Pt, y = top): [number, number, number] => [q[0] * k, y, -q[1] * k];

  const geom = useMemo(() => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x * k, y * k)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false, curveSegments: 4 });
    return g;
  }, [outline, k]);

  const edgeColor = p.dark ? "#e4e4e7" : "#1e3a8a";
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.9)";
  const pill = (text: string, color = p.text) => (
    <span style={{ color, background: bg, border: `1px solid ${color}55`, borderRadius: 6, padding: "1px 6px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      {text}
    </span>
  );

  return (
    <group position={[0, -0.6, 0]}>
      <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={p.primary} transparent opacity={0.85} />
        <Edges color={edgeColor} threshold={20} />
      </mesh>
      {grid.map(([a, b], i) => (
        <Line key={i} points={[to3(a), to3(b)]} color={p.dark ? "#e0f2fe" : "#ffffff"} lineWidth={1} transparent opacity={0.85} />
      ))}
      {dims.map((dm, i) => {
        const off = dm.offset ?? [0, 0];
        const from = to3(dm.from, top + 0.02);
        const to = to3(dm.to, top + 0.02);
        const mid = to3([(dm.from[0] + dm.to[0]) / 2 + off[0] / k, (dm.from[1] + dm.to[1]) / 2 + off[1] / k], top + 0.06);
        return (
          <group key={i}>
            <Line points={[from, to]} color={p.warning} lineWidth={2.5} />
            <Html position={mid} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              {pill(dm.text)}
            </Html>
          </group>
        );
      })}
      {marks.map((mk, i) => (
        <Html key={i} position={to3(mk.at, top + 0.06)} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          {pill(mk.text, p.accent)}
        </Html>
      ))}
      <Html position={[0, DEPTH + 0.9, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        {pill(areaLabel, p.primary)}
      </Html>
      <gridHelper args={[8, 16, p.grid, p.grid]} position={[0, -0.005, 0]} />
    </group>
  );
}
