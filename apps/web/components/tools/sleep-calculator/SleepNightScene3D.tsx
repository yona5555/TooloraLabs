"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { CYCLE_MIN, DAY, STAGE_COLORS, wrap } from "./sleep";

/**
 * A night-sky 24-hour clock: midnight at the top, time runs clockwise. Each option is a ring
 * (outer = most cycles): an amber stretch for falling asleep, then one block per 90-minute cycle
 * with a small gap between cycles, so the wake-up lands exactly on a cycle boundary. Rings with
 * more cycles stand taller. A pin marks the time you entered; a moon and stars sit above the dial.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type SleepNightScene3DProps = {
  rings: { cycles: number; color: string; bed: number; onset: number; wake: number; label: string }[];
  /** The time the visitor entered (minutes since midnight). */
  anchor: number;
  anchorLabel: string;
};

const R_DIAL = 1.62;
const R_OUT = 1.42;
const RING_W = 0.15;
const RING_STEP = 0.21;
const GAP_MIN = 4;

const theta = (m: number) => (m / DAY) * Math.PI * 2;
/** World point on the dial for a clock time (midnight = far side, clockwise seen from above). */
const at = (m: number, r: number, y = 0): [number, number, number] => [Math.sin(theta(m)) * r, y, -Math.cos(theta(m)) * r];

function sectorGeometry(m0: number, len: number, rIn: number, rOut: number, depth: number) {
  const a1 = Math.PI / 2 - theta(m0);
  const a0 = a1 - theta(Math.max(0.5, len));
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut, a0, a1, false);
  shape.absarc(0, 0, rIn, a1, a0, true);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function Sector({ m0, len, rIn, rOut, depth, color, y = 0, opacity = 1 }: { m0: number; len: number; rIn: number; rOut: number; depth: number; color: string; y?: number; opacity?: number }) {
  const geo = useMemo(() => sectorGeometry(m0, len, rIn, rOut, depth), [m0, len, rIn, rOut, depth]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

/** Deterministic star positions on an upper dome (stable between renders). */
function stars(n: number): number[] {
  let s = 11;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const el = 0.25 + rnd() * 1.1;
    const r = 2.6 + rnd() * 0.6;
    out.push(Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r * 0.8, Math.sin(a) * Math.cos(el) * r);
  }
  return out;
}

export default function SleepNightScene3D({ rings, anchor, anchorLabel }: SleepNightScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const key = rings.map((r) => `${r.bed}-${r.wake}`).join(",") + anchor;
  useEffect(() => {
    invalidate();
  }, [invalidate, key]);

  const starGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(stars(140), 3));
    return g;
  }, []);
  useEffect(() => () => starGeo.dispose(), [starGeo]);

  const sorted = [...rings].sort((a, b) => b.cycles - a.cycles);
  const maxCycles = sorted[0]?.cycles ?? 6;

  return (
    <group position={[0, -0.35, 0]}>
      {/* Dial: night face with hour ticks */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[R_DIAL + 0.08, R_DIAL, 0.06, 96]} />
        <meshStandardMaterial color={p.dark ? "#1e1b4b" : "#e0e7ff"} roughness={0.7} />
      </mesh>
      {Array.from({ length: 24 }, (_, h) => {
        const [x, , z] = at(h * 60, R_DIAL - 0.06);
        const major = h % 6 === 0;
        return (
          <mesh key={h} position={[x, 0.0, z]} rotation={[0, -theta(h * 60), 0]}>
            <boxGeometry args={[major ? 0.035 : 0.02, 0.02, major ? 0.14 : 0.07]} />
            <meshStandardMaterial color={p.dark ? "#c7d2fe" : "#4338ca"} />
          </mesh>
        );
      })}
      {[0, 6, 12, 18].map((h) => (
        <Label3D key={h} position={at(h * 60, R_DIAL + 0.22)} color={p.muted} text={h === 0 ? "12 AM" : h === 12 ? "12 PM" : h === 6 ? "6 AM" : "6 PM"} fontSize={10} />
      ))}

      {/* One ring per option: falling asleep (amber), then cycles with small gaps */}
      {sorted.map((r, i) => {
        const rOut = R_OUT - i * RING_STEP;
        const rIn = rOut - RING_W;
        const depth = 0.06 + (r.cycles / maxCycles) * 0.16;
        const lat = wrap(r.onset - r.bed);
        return (
          <group key={r.cycles}>
            {lat > 0 && <Sector m0={r.bed} len={lat} rIn={rIn} rOut={rOut} depth={0.05} color={STAGE_COLORS.wake} />}
            {Array.from({ length: r.cycles }, (_, c) => (
              <Sector key={c} m0={wrap(r.onset + c * CYCLE_MIN + GAP_MIN / 2)} len={CYCLE_MIN - GAP_MIN} rIn={rIn} rOut={rOut} depth={depth} color={r.color} />
            ))}
          </group>
        );
      })}

      {/* Labels at each option's suggested time, just outside the dial */}
      {sorted.map((r, i) => {
        const m = r.bed === anchor ? r.wake : r.bed;
        const [x, , z] = at(m, R_DIAL + 0.42 + (i % 2) * 0.28);
        return <Label3D key={`l${r.cycles}`} position={[x, 0.12, z]} color={p.text} bg={bg} border={r.color} text={r.label} fontSize={10.5} weight={800} />;
      })}

      {/* Pin at the entered time */}
      <mesh position={at(anchor, R_DIAL - 0.02, 0.32)}>
        <cylinderGeometry args={[0.025, 0.025, 0.64, 12]} />
        <meshStandardMaterial color={p.warning} />
      </mesh>
      <mesh position={at(anchor, R_DIAL - 0.02, 0.66)}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color={p.warning} emissive={p.warning} emissiveIntensity={0.4} />
      </mesh>
      <Label3D position={at(anchor, R_DIAL - 0.02, 0.84)} color={p.primary} bg={bg} text={anchorLabel} weight={800} />

      {/* Moon and stars */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={p.dark ? "#fef3c7" : "#fde68a"} emissive={p.dark ? "#fde68a" : "#f59e0b"} emissiveIntensity={p.dark ? 0.6 : 0.25} roughness={0.9} />
      </mesh>
      <points geometry={starGeo}>
        <pointsMaterial color={p.dark ? "#e0e7ff" : "#6366f1"} size={0.035} sizeAttenuation />
      </points>
    </group>
  );
}
