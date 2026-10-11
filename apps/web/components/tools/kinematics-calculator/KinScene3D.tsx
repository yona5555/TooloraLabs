"use client";

import * as THREE from "three";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

type P3 = [number, number, number];

export type KinSceneData = {
  /** Position at nine equal instants from 0 to the end of the motion (m). */
  x: number[];
  /** Velocity at the same instants, divided by the largest |v| (−1…1). */
  v: number[];
  a: number;
  /** Where the car stops and turns back, if it does (m). */
  turningX: number | null;
  labels: { accel: string; speeds: string[]; times: string[]; turning: string };
};

const HALF = 3;
const COL_MAX = 2.1;
const COL_Z = -0.75;

/** Straight arrow from `from` to `to` (shaft + cone head). */
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

/** A small car: body, cabin and four wheels; `facing` flips it for motion in −x. */
function Car({ x, facing, color, opacity }: { x: number; facing: 1 | -1; color: string; opacity: number }) {
  const solid = opacity >= 1;
  const mat = <meshStandardMaterial color={color} transparent={!solid} opacity={opacity} depthWrite={solid} roughness={0.45} />;
  return (
    <group position={[x, 0, 0]} scale={[facing, 1, 1]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.62, 0.2, 0.36]} />
        {mat}
      </mesh>
      <mesh position={[-0.06, 0.36, 0]}>
        <boxGeometry args={[0.32, 0.14, 0.32]} />
        {mat}
      </mesh>
      {[-0.2, 0.2].flatMap((wx) =>
        [-0.19, 0.19].map((wz) => (
          <mesh key={`${wx}${wz}`} position={[wx, 0.08, wz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
            <meshStandardMaterial color="#27272a" transparent={!solid} opacity={opacity} depthWrite={solid} />
          </mesh>
        )),
      )}
    </group>
  );
}

/**
 * Constant-acceleration motion along a track: the car at nine equal instants (faint → solid),
 * the widening (or shrinking) gaps are the acceleration; a speed column v(t) stands behind each
 * copy — its tops trace the straight v–t line — and velocity arrows at the start, middle and end.
 * A reversal is marked where v = 0.
 */
export default function KinScene3D({ data: d }: { data: KinSceneData }) {
  const p = usePalette3D();
  const lo = Math.min(0, ...d.x, d.turningX ?? 0);
  const hi = Math.max(0, ...d.x, d.turningX ?? 0);
  const range = hi - lo;
  const X = (x: number) => (range > 1e-12 ? -HALF + ((x - lo) / range) * 2 * HALF : 0);
  const n = d.x.length - 1;
  const moving = range > 1e-12;
  const facing = (i: number): 1 | -1 => ((d.v[i] ?? 0) < 0 ? -1 : 1);
  const arrows = [0, Math.round(n / 2), n];

  return (
    <group position={[0, -1.3, 0]}>
      {/* track with a centre dash */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[2 * HALF + 1.2, 0.08, 1.2]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      <Line points={[[-HALF - 0.5, 0.005, 0.5], [HALF + 0.5, 0.005, 0.5]]} color={p.muted} lineWidth={1} dashed dashSize={0.18} gapSize={0.12} />
      {/* speed columns and the v–t line through their tops */}
      {moving &&
        d.v.map((v, i) => {
          const h = Math.max(0.02, Math.abs(v) * COL_MAX);
          return (
            <mesh key={`c${i}`} position={[X(d.x[i]), h / 2, COL_Z]}>
              <boxGeometry args={[0.1, h, 0.1]} />
              <meshStandardMaterial color={v < 0 ? p.warning : p.accent} transparent opacity={0.85} />
            </mesh>
          );
        })}
      {moving && <Line points={d.v.map((v, i) => [X(d.x[i]), Math.max(0.02, Math.abs(v) * COL_MAX), COL_Z] as P3)} color={p.accent} lineWidth={2} />}
      {/* the car at each instant */}
      {d.x.map((x, i) =>
        moving || i === 0 ? <Car key={`car${i}`} x={X(x)} facing={facing(i)} color={p.primary} opacity={i === n || !moving ? 1 : 0.14 + (0.5 * i) / n} /> : null,
      )}
      {/* velocity arrows at the start, middle and end, with their values */}
      {arrows.map((i, k) => {
        const len = 0.25 + 1.1 * Math.abs(d.v[i]);
        const x0 = X(d.x[i]);
        const y = 0.72 + (k % 2) * 0.55;
        const s = d.v[i] < 0 ? -1 : 1;
        return (
          <group key={`v${i}`}>
            {Math.abs(d.v[i]) > 1e-9 && <Arrow from={[x0, y, 0]} to={[x0 + s * len, y, 0]} color={p.positive} width={3.5} />}
            <Label3D position={[x0, y + 0.26, 0]} color={p.positive} weight={700}>
              {d.labels.speeds[i]}
            </Label3D>
          </group>
        );
      })}
      {/* time · position stamps under the track */}
      {(moving ? arrows : [0]).map((i, k) => (
        <Label3D key={`t${i}`} position={[X(d.x[i]), k % 2 === 0 ? -0.34 : -0.66, 0.6]} color={p.text}>
          {d.labels.times[i]}
        </Label3D>
      ))}
      {/* constant acceleration, shown once above the scene */}
      <Arrow from={[-0.55 * (d.a < 0 ? -1 : 1), 2.55, 0]} to={[0.55 * (d.a < 0 ? -1 : 1), 2.55, 0]} color={p.danger} width={4} />
      <Label3D position={[0, 2.88, 0]} color={p.danger} weight={700}>
        {d.labels.accel}
      </Label3D>
      {d.turningX !== null && (
        <group>
          <Line points={[[X(d.turningX), 0, 0.62], [X(d.turningX), 0.6, 0.62]]} color={p.warning} lineWidth={2} dashed dashSize={0.08} gapSize={0.05} />
          <Label3D position={[X(d.turningX), 0.8, 0.62]} color={p.warning} weight={700}>
            {d.labels.turning}
          </Label3D>
        </group>
      )}
    </group>
  );
}
