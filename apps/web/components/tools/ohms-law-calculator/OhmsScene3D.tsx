"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMotionEpisode } from "@/components/tool-ui/motion/motion";
import { useSceneFrame } from "@/components/tool-ui/motion/scene-motion";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

type P3 = [number, number, number];

export type OhmsScene3DProps = {
  data: {
    voltage: number;
    current: number;
    resistance: number;
    power: number;
    labels: { voltage: string; current: string; resistance: string; power: string; plus: string; minus: string };
  };
};

/** Loop corners: battery on the left side, resistor on the top side. */
const X = 2.5;
const Y = 1.35;
const CORNERS: P3[] = [
  [-X, -Y, 0],
  [-X, Y, 0],
  [X, Y, 0],
  [X, -Y, 0],
  [-X, -Y, 0],
];
const SIDES = [2 * Y, 2 * X, 2 * Y, 2 * X];
const PERIMETER = SIDES.reduce((s, v) => s + v, 0);
const PARTICLES = 28;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const log = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-30));

/** Point at arc length `s` along the loop, in the conventional-current direction (+ terminal up, across the top, down, back). */
function along(s: number, out: THREE.Vector3) {
  let d = ((s % PERIMETER) + PERIMETER) % PERIMETER;
  for (let k = 0; k < 4; k++) {
    if (d <= SIDES[k]) {
      const a = CORNERS[k];
      const b = CORNERS[k + 1];
      const u = d / SIDES[k];
      return out.set(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 0);
    }
    d -= SIDES[k];
  }
  return out.set(...CORNERS[0]);
}

/**
 * Charges flowing round the loop. Their speed follows the current on a log scale (0.001 A crawls,
 * 100 A races), so changing V or R visibly speeds them up or slows them down: they flow during a motion
 * episode after the current changes (tool-ui/motion), and rest in place otherwise.
 */
function Charges({ current, color }: { current: number; color: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const invalidate = useThree((s) => s.invalidate);
  const offset = useRef(0);
  const { active } = useMotionEpisode([current]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const speed = 0.25 + 2.6 * clamp((log(current) + 3) / 5, 0, 1);
  const dir = current < 0 ? -1 : 1;

  useEffect(() => {
    invalidate();
  }, [invalidate, speed]);

  useSceneFrame((_, dt) => {
    offset.current += dir * speed * dt;
    refs.current.forEach((m, i) => {
      if (!m) return;
      along(offset.current + (i * PERIMETER) / PARTICLES, tmp);
      m.position.copy(tmp);
    });
  }, active);

  return (
    <group>
      {Array.from({ length: PARTICLES }, (_, i) => (
        <mesh key={i} ref={(m) => void (refs.current[i] = m)}>
          <sphereGeometry args={[0.075, 14, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The circuit: a battery (cell height grows with V), copper wire, a resistor whose body glows
 * hotter with the power it dissipates (log scale) and whose length follows R, and conventional
 * charges flowing at a speed set by I.
 */
export default function OhmsScene3D({ data }: OhmsScene3DProps) {
  const p = usePalette3D();
  const heat = clamp((log(data.power) + 2) / 6, 0, 1);
  const rLen = 1.2 + 1.0 * clamp((log(data.resistance) + 2) / 8, 0, 1);
  const cell = 0.8 + 0.7 * clamp((log(data.voltage) + 1) / 4, 0, 1);
  const wire = p.dark ? "#d97706" : "#b45309";
  const bands = ["#a16207", "#7c3aed", "#dc2626", "#d4af37"];
  const hot = new THREE.Color(p.dark ? "#3f3f46" : "#e7d3b0").lerp(new THREE.Color("#ef4444"), heat);

  return (
    <group position={[0, -0.15, 0]}>
      {/* wire loop */}
      <Line points={CORNERS} color={wire} lineWidth={4} />
      {/* battery on the left side: body, + cap on top */}
      <mesh position={[-X, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, cell, 32]} />
        <meshStandardMaterial color={p.primary} roughness={0.4} />
      </mesh>
      <mesh position={[-X, cell / 2 + 0.06, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.12, 20]} />
        <meshStandardMaterial color={p.muted} metalness={0.4} roughness={0.3} />
      </mesh>
      <Label3D position={[-X + 0.55, cell / 2 - 0.05, 0]} color={p.danger} weight={700}>
        {data.labels.plus}
      </Label3D>
      <Label3D position={[-X + 0.55, -cell / 2 + 0.05, 0]} color={p.primary} weight={700}>
        {data.labels.minus}
      </Label3D>
      <Label3D position={[-X - 0.1, -Y - 0.45, 0]} align="left" color={p.primary} weight={700}>
        {data.labels.voltage}
      </Label3D>
      {/* resistor on the top side: glowing body with colour bands */}
      <group position={[0, Y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, rLen, 32]} />
          <meshStandardMaterial color={hot} emissive="#ef4444" emissiveIntensity={heat * 0.9} roughness={0.5} />
        </mesh>
        {bands.map((c, i) => (
          <mesh key={c} position={[0, rLen / 2 - 0.22 - i * 0.18 - (i === 3 ? 0.12 : 0), 0]}>
            <cylinderGeometry args={[0.245, 0.245, 0.07, 32]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
      </group>
      <Label3D position={[0, Y + 0.65, 0]} color={p.warning} weight={700}>
        {data.labels.resistance}
      </Label3D>
      <Label3D position={[0, Y - 0.55, 0]} color={p.danger} weight={700}>
        {data.labels.power}
      </Label3D>
      {/* current label inside the loop, beside the downward flow on the right side (never past the canvas edge) */}
      <Label3D position={[X - 0.2, 0, 0]} align="right" color={p.positive} weight={700}>
        {data.labels.current}
      </Label3D>
      <Charges current={data.current} color={p.positive} />
    </group>
  );
}
