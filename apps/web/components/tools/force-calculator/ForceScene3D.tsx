"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

type P3 = [number, number, number];

export type SecondLawSceneData = {
  kind: "secondLaw";
  mass: number;
  force: number;
  acceleration: number;
  /** Distance from rest at t = 0…4 s (m). */
  x: number[];
  labels: { force: string; acceleration: string; mass: string; times: string[]; speeds: string[] };
};

export type GravitationSceneData = {
  kind: "gravitation";
  mass1: number;
  mass2: number;
  labels: { mass1: string; mass2: string; force: string; distance: string };
};

export type ForceScene3DProps = { data: SecondLawSceneData | GravitationSceneData };

const X1 = -2.2;
const X2 = 2.2;
const BASE = -2;
/** Second-law layout: strobe span (t = 0 → 4 s), height of the 4-second speed column, its depth. */
const SPAN = 4.4;
const V_HEIGHT = 4;
const V_Z = -0.62;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const log = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-30));

/** Straight arrow from `from` to `to` (shaft + cone head). */
function Arrow({ from, to, color, width = 4 }: { from: P3; to: P3; color: string; width?: number }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const v = b.clone().sub(a);
  const len = v.length();
  if (len < 1e-6) return null;
  const head = Math.min(0.32, len * 0.4);
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
 * F = ma as a block on a track: block size follows the mass (log scale), the push arrow F and the
 * acceleration arrow a, and translucent "strobe" copies where the block is after 1, 2, 3 and 4 s
 * from rest (x = ½at²) — the widening gaps are the acceleration — with a speed column v = at
 * standing behind each copy, growing linearly while the gaps grow quadratically.
 */
function SecondLawScene({ d }: { d: SecondLawSceneData }) {
  const p = usePalette3D();
  const s = 0.5 + 0.5 * clamp((log(d.mass) + 1) / 7, 0, 1);
  const sgn = d.acceleration < 0 ? -1 : 1;
  const X0 = -1.7 * sgn;
  const x4 = Math.abs(d.x[4]);
  const at = (i: number) => X0 + sgn * (x4 > 0 ? (Math.abs(d.x[i]) / x4) * SPAN : 0);
  const fLen = 0.7 + 0.075 * clamp(log(d.force) + 3, 0, 12);
  const back = X0 - sgn * (s / 2 + 0.12);
  const moving = x4 > 0;

  return (
    <group position={[0.2 * sgn, -1.8, 0]}>
      {/* track */}
      <mesh position={[-0.35 * sgn, -0.04, 0]}>
        <boxGeometry args={[7.5, 0.08, 1.8]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {/* strobe copies at t = 1…4 s, their floor ticks and the speed column v = at behind each */}
      {moving &&
        [1, 2, 3, 4].map((i) => {
          const h = (V_HEIGHT * i) / 4;
          return (
            <group key={i}>
              <mesh position={[at(i), s / 2, 0]}>
                <boxGeometry args={[s, s, s]} />
                <meshStandardMaterial color={p.primary} transparent opacity={0.1 + i * 0.05} depthWrite={false} />
              </mesh>
              <mesh position={[at(i), 0.005, 0.93]}>
                <boxGeometry args={[0.03, 0.02, 0.2]} />
                <meshBasicMaterial color={p.muted} />
              </mesh>
              <mesh position={[at(i), h / 2, V_Z]}>
                <boxGeometry args={[0.14, h, 0.14]} />
                <meshStandardMaterial color={p.accent} transparent opacity={0.85} />
              </mesh>
              {i >= 2 && (
                <Label3D position={[at(i), h + 0.24, V_Z]} color={p.accent} weight={700}>
                  {d.labels.speeds[i]}
                </Label3D>
              )}
            </group>
          );
        })}
      {/* the block at t = 0 */}
      <mesh position={[X0, s / 2, 0]}>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color={p.primary} roughness={0.45} metalness={0.05} />
      </mesh>
      <Label3D position={[X0, s / 2, s / 2 + 0.02]} color="#ffffff" weight={700}>
        {d.labels.mass}
      </Label3D>
      {/* applied force pushing from behind */}
      <Arrow from={[back - sgn * fLen, s / 2, 0]} to={[back, s / 2, 0]} color={p.danger} width={5} />
      {/* stacked above the a label (never beside it), so the two can't collide at any value */}
      <Label3D position={[X0 - sgn * 0.6, s + 1.05, 0]} color={p.danger} weight={700}>
        {d.labels.force}
      </Label3D>
      {/* acceleration above the block */}
      {moving && <Arrow from={[X0 - sgn * 0.25, s + 0.28, 0]} to={[X0 + sgn * 0.95, s + 0.28, 0]} color={p.positive} width={3.5} />}
      <Label3D position={[X0 + sgn * 0.35, s + 0.62, 0]} color={p.positive} weight={700}>
        {d.labels.acceleration}
      </Label3D>
      {/* time stamps (t = 1 s is too close to t = 0 to label) */}
      {[0, 2, 3, 4].map((i, k) =>
        moving || i === 0 ? (
          <Label3D key={i} position={[at(i), k % 2 === 0 ? -0.32 : -0.62, 0.9]} color={p.text}>
            {d.labels.times[i]}
          </Label3D>
        ) : null,
      )}
    </group>
  );
}

/**
 * Universal gravitation: two spheres sized by mass (log scale), equal and opposite pull arrows
 * (Newton's third law), the centre-to-centre distance r, and the pair's real gravitational
 * potential −Gm₁/|x−x₁| − Gm₂/|x−x₂| as a wireframe well (depth relative to the deepest point).
 */
function GravitationScene({ d }: { d: GravitationSceneData }) {
  const p = usePalette3D();
  const L1 = log(d.mass1);
  const L2 = log(d.mass2);
  const lo = Math.min(L1, L2);
  const hi = Math.max(L1, L2);
  const R = (L: number) => (hi - lo < 1e-9 ? 0.6 : 0.3 + 0.55 * ((L - lo) / (hi - lo)));
  const R1 = R(L1);
  const R2 = R(L2);
  const gap = X2 - X1 - R1 - R2;
  const aLen = Math.min(1.1, (gap - 0.3) / 2);
  const total = Math.abs(d.mass1) + Math.abs(d.mass2);
  const bary = total > 0 ? X1 + (X2 - X1) * (Math.abs(d.mass2) / total) : 0;
  const rTop = Math.max(R1, R2);
  const yDim = -rTop - 0.45;

  const well = useMemo(() => {
    const g = new THREE.PlaneGeometry(9, 4.4, 44, 22);
    g.rotateX(-Math.PI / 2);
    const w1 = total > 0 ? Math.abs(d.mass1) / Math.max(Math.abs(d.mass1), Math.abs(d.mass2)) : 0;
    const w2 = total > 0 ? Math.abs(d.mass2) / Math.max(Math.abs(d.mass1), Math.abs(d.mass2)) : 0;
    const eps = 0.55;
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const phi = w1 / Math.hypot(x - X1, z, eps) + w2 / Math.hypot(x - X2, z, eps);
      pos.setY(i, BASE - Math.min(1.5, 1.3 * eps * phi));
    }
    pos.needsUpdate = true;
    return g;
  }, [d.mass1, d.mass2, total]);

  return (
    <group position={[0, 0.8, 0]}>
      <mesh geometry={well}>
        <meshBasicMaterial color={p.muted} wireframe transparent opacity={0.35} />
      </mesh>
      <mesh position={[X1, 0, 0]}>
        <sphereGeometry args={[R1, 40, 28]} />
        <meshStandardMaterial color={p.primary} roughness={0.4} />
      </mesh>
      <mesh position={[X2, 0, 0]}>
        <sphereGeometry args={[R2, 40, 28]} />
        <meshStandardMaterial color={p.warning} roughness={0.4} />
      </mesh>
      {/* equal and opposite pulls */}
      <Arrow from={[X1 + R1 + 0.1, 0, 0]} to={[X1 + R1 + 0.1 + aLen, 0, 0]} color={p.danger} width={5} />
      <Arrow from={[X2 - R2 - 0.1, 0, 0]} to={[X2 - R2 - 0.1 - aLen, 0, 0]} color={p.danger} width={5} />
      {/* m₁ and m₂ on separate rows (anchored inward from each sphere), F under the arrows */}
      <Label3D position={[(X1 + R1 + X2 - R2) / 2, -0.4, 0]} color={p.danger} weight={700}>
        {d.labels.force}
      </Label3D>
      <Label3D position={[X1 - R1, rTop + 0.35, 0]} align="left" color={p.primary} weight={700}>
        {d.labels.mass1}
      </Label3D>
      <Label3D position={[X2 + R2, rTop + 0.8, 0]} align="right" color={p.warning} weight={700}>
        {d.labels.mass2}
      </Label3D>
      {/* r dimension line with the barycentre tick */}
      <Line points={[[X1, yDim, 0], [X2, yDim, 0]]} color={p.muted} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.08} />
      {[X1, X2].map((x) => (
        <Line key={x} points={[[x, yDim - 0.1, 0], [x, yDim + 0.1, 0]]} color={p.muted} lineWidth={1.5} />
      ))}
      <mesh position={[bary, yDim, 0]}>
        <octahedronGeometry args={[0.09]} />
        <meshStandardMaterial color={p.accent} />
      </mesh>
      <Label3D position={[0, yDim - 0.34, 0]} color={p.text}>
        {d.labels.distance}
      </Label3D>
    </group>
  );
}

/** Heavy part of the live drawing: only ever loaded through next/dynamic inside a <Scene3D>. */
export default function ForceScene3D({ data }: ForceScene3DProps) {
  return data.kind === "secondLaw" ? <SecondLawScene d={data} /> : <GravitationScene d={data} />;
}
