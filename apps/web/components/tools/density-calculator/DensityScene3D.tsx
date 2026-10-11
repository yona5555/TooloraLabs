"use client";

import * as THREE from "three";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

type P3 = [number, number, number];

export type DensityScene3DProps = {
  data: {
    /** Cube edge ∛V (cm). */
    edge: number;
    /** Inner tank width (cm), a 1/2/5 × 10ⁿ value ≥ 3 edges, so the cube is drawn to true scale. */
    tankWidth: number;
    /** Fraction of the cube under water at rest (1 = sunk). */
    submerged: number;
    floats: boolean;
    /** Weight and buoyant force at rest (N), drawn as arrows in proportion. */
    weight: number;
    buoyancy: number;
    labels: { edge: string; density: string; mass: string; tank: string; waterline: string; weight: string; buoyancy: string; water: string };
  };
};

/** Scene width of the tank's inner width (world units). */
const TW = 4.4;
const TD = 2.2;
const ARROW_MAX = 1.5;

function Arrow({ from, to, color, width = 4 }: { from: P3; to: P3; color: string; width?: number }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const v = b.clone().sub(a);
  const len = v.length();
  if (len < 1e-6) return null;
  const head = Math.min(0.28, len * 0.45);
  const dir = v.clone().normalize();
  const shaftEnd = a.clone().add(dir.clone().multiplyScalar(len - head));
  const conePos = a.clone().add(dir.clone().multiplyScalar(len - head / 2));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <group>
      <Line points={[from, shaftEnd.toArray() as P3]} color={color} lineWidth={width} />
      <mesh position={conePos.toArray() as P3} quaternion={q}>
        <coneGeometry args={[head * 0.42, head, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/**
 * A cube of the material, drawn to true scale inside a glass water tank whose width is a round
 * number of centimetres (shown on the ruler). It floats with exactly ρ/ρ_water of its height under
 * the surface, or rests on the floor when denser than water; the weight W and the buoyant force
 * F_b are drawn as arrows in proportion (equal when floating).
 */
export default function DensityScene3D({ data: d }: DensityScene3DProps) {
  const p = usePalette3D();
  const k = TW / d.tankWidth;
  const s = d.edge * k;
  const TH = TW * 0.72;
  const WL = TW * 0.5;
  const floor = -TH / 2;
  const surface = floor + WL;
  const bottom = d.floats ? surface - d.submerged * s : floor;
  const cy = bottom + s / 2;
  const maxF = Math.max(d.weight, d.buoyancy, 1e-30);
  const wLen = 0.35 + (ARROW_MAX - 0.35) * (d.weight / maxF);
  const bLen = 0.35 + (ARROW_MAX - 0.35) * (d.buoyancy / maxF);
  const water = p.dark ? "#0ea5e9" : "#38bdf8";
  const glass = p.dark ? "#a1a1aa" : "#64748b";
  const cube = p.dark ? "#f59e0b" : "#d97706";
  const xL = -TW / 2;
  const xR = TW / 2;
  const zF = TD / 2;
  const zB = -TD / 2;
  const top = floor + TH;
  const corners: P3[][] = [
    [[xL, floor, zF], [xR, floor, zF], [xR, top, zF], [xL, top, zF], [xL, floor, zF]],
    [[xL, floor, zB], [xR, floor, zB], [xR, top, zB], [xL, top, zB], [xL, floor, zB]],
    [[xL, floor, zF], [xL, floor, zB]],
    [[xR, floor, zF], [xR, floor, zB]],
    [[xL, top, zF], [xL, top, zB]],
    [[xR, top, zF], [xR, top, zB]],
  ];
  const cx = -0.35;
  const yRuler = floor - 0.32;

  return (
    <group position={[0, 0.15, 0]}>
      {/* glass tank edges and floor */}
      {corners.map((pts, i) => (
        <Line key={i} points={pts} color={glass} lineWidth={1.5} />
      ))}
      <mesh position={[0, floor - 0.03, 0]}>
        <boxGeometry args={[TW, 0.06, TD]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {/* water volume and its surface */}
      <mesh position={[0, floor + WL / 2, 0]}>
        <boxGeometry args={[TW - 0.02, WL, TD - 0.02]} />
        <meshStandardMaterial color={water} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Line points={[[xL, surface, zF], [xR, surface, zF], [xR, surface, zB], [xL, surface, zB], [xL, surface, zF]]} color={water} lineWidth={2} />
      <Label3D position={[xR - 0.05, surface + 0.16, zF]} align="right" color={water} weight={700}>
        {d.labels.water}
      </Label3D>
      {/* the cube (true scale) */}
      <mesh position={[cx, cy, 0]}>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color={cube} roughness={0.5} metalness={0.15} />
      </mesh>
      {d.floats && d.submerged < 1 && (
        <Line
          points={[[cx - s / 2 - 0.02, surface, s / 2 + 0.01], [cx + s / 2 + 0.02, surface, s / 2 + 0.01]]}
          color={p.text}
          lineWidth={2}
          dashed
          dashSize={0.06}
          gapSize={0.04}
        />
      )}
      {/* forces: W from the centre down, F_b from the centre of buoyancy up */}
      <Arrow from={[cx + s / 2 + 0.3, cy, 0]} to={[cx + s / 2 + 0.3, cy - wLen, 0]} color={p.danger} width={4} />
      <Arrow from={[cx - s / 2 - 0.3, cy, 0]} to={[cx - s / 2 - 0.3, cy + bLen, 0]} color={p.positive} width={4} />
      <Label3D position={[cx + s / 2 + 0.42, cy - wLen, 0]} align="left" color={p.danger} weight={700}>
        {d.labels.weight}
      </Label3D>
      <Label3D position={[cx - s / 2 - 0.42, cy + bLen, 0]} align="right" color={p.positive} weight={700}>
        {d.labels.buoyancy}
      </Label3D>
      {/* cube readouts stacked above the tank */}
      <Label3D position={[cx, top + 0.75, 0]} color={cube} weight={700}>
        {d.labels.density}
      </Label3D>
      <Label3D position={[cx, top + 0.4, 0]} color={p.text}>
        {`${d.labels.mass} · ${d.labels.edge}`}
      </Label3D>
      <Label3D position={[xR + 0.12, d.floats ? surface - (d.submerged * s) / 2 : floor + s / 2, 0]} align="left" color={p.accent} weight={700}>
        {d.labels.waterline}
      </Label3D>
      {/* true-scale ruler: tank inner width */}
      <Line points={[[xL, yRuler, zF], [xR, yRuler, zF]]} color={p.muted} lineWidth={1.5} />
      {Array.from({ length: 11 }, (_, i) => xL + (TW * i) / 10).map((x, i) => (
        <Line key={i} points={[[x, yRuler, zF], [x, yRuler + (i % 5 === 0 ? 0.16 : 0.08), zF]]} color={p.muted} lineWidth={1.2} />
      ))}
      <Label3D position={[0, yRuler - 0.24, zF]} color={p.text}>
        {d.labels.tank}
      </Label3D>
    </group>
  );
}
