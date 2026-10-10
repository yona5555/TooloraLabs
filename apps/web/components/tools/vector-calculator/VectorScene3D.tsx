"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { angleArcPoints, vecMag, type Vec3 } from "@tooloralabs/tools";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * A, B, A+B, the parallelogram A and B span, A×B (normal to it), the projection of A onto B and
 * the angle arc, as real 3D arrows. Heavy (three + drei): imported ONLY through next/dynamic
 * inside a <Scene3D>. Math axes map to three as (x, y, z) → (x, z, −y), a proper rotation, so
 * the right-hand rule of A×B is drawn faithfully.
 */
export type VectorScene3DProps = {
  a: Vec3;
  b: Vec3;
  sum: Vec3;
  cross: Vec3;
  proj: Vec3 | null;
  labels: { a: string; b: string; sum: string; cross: string; proj: string; angle: string; area: string };
};

const FIT = 3;
type P3 = [number, number, number];

function arrowParts(tip: P3) {
  const v = new THREE.Vector3(...tip);
  const len = v.length();
  const head = Math.min(0.32, len * 0.35);
  const dir = len > 1e-9 ? v.clone().normalize() : new THREE.Vector3(0, 1, 0);
  const shaftEnd = dir.clone().multiplyScalar(Math.max(0, len - head));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const conePos = dir.clone().multiplyScalar(len - head / 2);
  return { len, head, shaftEnd: shaftEnd.toArray() as P3, q, conePos: conePos.toArray() as P3 };
}

function Arrow({ from = [0, 0, 0], tip, color, width = 3.5 }: { from?: P3; tip: P3; color: string; width?: number }) {
  const rel: P3 = [tip[0] - from[0], tip[1] - from[1], tip[2] - from[2]];
  const { len, head, shaftEnd, q, conePos } = arrowParts(rel);
  if (len < 1e-6) return null;
  return (
    <group position={from}>
      <Line points={[[0, 0, 0], shaftEnd]} color={color} lineWidth={width} />
      <mesh position={conePos} quaternion={q}>
        <coneGeometry args={[head * 0.38, head, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function VectorScene3D({ a, b, sum, cross, proj, labels }: VectorScene3DProps) {
  const p = usePalette3D();
  const reach = Math.max(vecMag(a), vecMag(b), vecMag(sum), 1e-9);
  const k = FIT / reach;
  const to3 = (v: Vec3, s = k): P3 => [v[0] * s, v[2] * s, -v[1] * s];

  const A = to3(a);
  const B = to3(b);
  const S = to3(sum);
  // |A×B| is an area, not a length: drawn along its true direction at sin θ of the scene size,
  // with the real value in its label.
  const cm = vecMag(cross);
  const sinT = vecMag(a) > 0 && vecMag(b) > 0 ? cm / (vecMag(a) * vecMag(b)) : 0;
  const C = cm > 1e-9 ? to3(cross, (FIT * 0.85 * Math.max(sinT, 0.25)) / cm) : null;
  const P = proj ? to3(proj) : null;
  const arcR = Math.min(vecMag(a), vecMag(b)) * k * 0.35;
  const arc = angleArcPoints(a, b, 1).map((q) => to3(q, arcR));
  const arcMid = arc.length ? arc[Math.floor(arc.length / 2)] : null;

  const faceKey = cm > 1e-9 ? [...A, ...S, ...B].join(",") : "";
  const parallelogram = useMemo(() => {
    if (!faceKey) return null;
    const [ax, ay, az, sx, sy, sz, bx, by, bz] = faceKey.split(",").map(Number);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, ax, ay, az, sx, sy, sz, 0, 0, 0, sx, sy, sz, bx, by, bz], 3));
    g.computeVertexNormals();
    return g;
  }, [faceKey]);

  const bg = p.dark ? "rgba(24,24,27,0.88)" : "rgba(255,255,255,0.92)";
  const label = (at: P3, text: string, color: string, lift = 0.22) => (
    <Label3D position={[at[0], at[1] + lift, at[2]]} color={color} bg={bg} text={text} weight={700} />
  );
  const axisLen = FIT * 1.15;

  return (
    <group position={[0, -0.4, 0]}>
      <gridHelper args={[8, 16, p.grid, p.grid]} />
      {/* Axes: math x, y, z */}
      <Line points={[[-axisLen, 0, 0], [axisLen, 0, 0]]} color={p.muted} lineWidth={1} />
      <Line points={[[0, 0, axisLen], [0, 0, -axisLen]]} color={p.muted} lineWidth={1} />
      <Line points={[[0, -0.2, 0], [0, axisLen, 0]]} color={p.muted} lineWidth={1} />
      {label([axisLen + 0.2, 0, 0], "x", p.muted, 0)}
      {label([0, 0, -axisLen - 0.2], "y", p.muted, 0)}
      {label([0, axisLen + 0.2, 0], "z", p.muted, 0)}

      {parallelogram && (
        <mesh geometry={parallelogram}>
          <meshStandardMaterial color={p.accent} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {/* Parallelogram edges: B from A's tip, A from B's tip */}
      <Line points={[A, S]} color={p.positive} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.08} />
      <Line points={[B, S]} color={p.primary} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.08} />

      <Arrow tip={A} color={p.primary} />
      <Arrow tip={B} color={p.positive} />
      <Arrow tip={S} color={p.accent} width={3} />
      {C && <Arrow tip={C} color={p.danger} width={3} />}
      {P && (
        <>
          <Arrow tip={P} color={p.warning} width={4.5} />
          <Line points={[A, P]} color={p.warning} lineWidth={1.2} dashed dashSize={0.08} gapSize={0.06} />
        </>
      )}
      {arc.length > 1 && <Line points={arc} color={p.text} lineWidth={2} />}

      {label(A, labels.a, p.primary)}
      {label(B, labels.b, p.positive)}
      {label(S, labels.sum, p.accent)}
      {C && label(C, labels.cross, p.danger)}
      {P && vecMag(proj as Vec3) > 1e-9 && label(P, labels.proj, p.warning, -0.25)}
      {arcMid && label(arcMid, labels.angle, p.text, 0.12)}
      {parallelogram && label([S[0] / 2, S[1] / 2, S[2] / 2], labels.area, p.accent, 0)}
    </group>
  );
}
