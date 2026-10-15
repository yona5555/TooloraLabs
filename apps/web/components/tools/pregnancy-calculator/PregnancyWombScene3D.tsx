"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { ACOG_TRI, FULL_TERM, TRI_COLORS, uterusCm, wd } from "./preg";

/**
 * A live womb: a translucent uterus whose size follows the typical growth by week (about 7.5 cm
 * before pregnancy, fundus near 35 cm at term), the fetus inside curled to the calculator's length
 * for the week, a placenta and cord, and a ruler with the uterus length in real centimetres. The
 * view is normalised (the uterus grows on screen from 0.9 to 2.2 units) so early weeks stay
 * visible; everything inside keeps true proportions to the uterus. Around the base, a 40-week ring
 * split into the three ACOG trimesters fills up to today with a pin at the gestational age.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type PregnancyWombScene3DProps = {
  /** Gestational age in days. */
  ga: number;
  /** The calculator's length for the week (crown-rump to 19 w, crown-heel from 20 w). */
  lengthCm: number;
  weightG: number;
};

const R_RING = 1.42;
const RING_W = 0.16;
const BASE_Y = -1.05;

const theta = (d: number) => (d / FULL_TERM) * Math.PI * 2;
/** Point on the ring for a GA day (day 0 at the front, clockwise seen from above). */
const at = (d: number, r: number, y = 0): [number, number, number] => [Math.sin(theta(d)) * r, y, Math.cos(theta(d)) * r];

function sectorGeometry(d0: number, len: number, rIn: number, rOut: number, depth: number) {
  const a0 = Math.PI / 2 - theta(d0) - theta(len);
  const a1 = Math.PI / 2 - theta(d0);
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut, a0, a1, false);
  shape.absarc(0, 0, rIn, a1, a0, true);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 });
  g.rotateX(-Math.PI / 2);
  // Shape space has +y toward −z after rotateX; mirror so day 0 sits at the front (+z).
  g.scale(1, 1, -1);
  return g;
}

function Sector({ d0, len, rIn, rOut, depth, color, y = 0, opacity = 1 }: { d0: number; len: number; rIn: number; rOut: number; depth: number; color: string; y?: number; opacity?: number }) {
  const geo = useMemo(() => sectorGeometry(d0, Math.max(0.3, len), rIn, rOut, depth), [d0, len, rIn, rOut, depth]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshStandardMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function PregnancyWombScene3D({ ga, lengthCm, weightG }: PregnancyWombScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, ga, lengthCm, p.dark]);
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";

  const week = ga / 7;
  const Lcm = uterusCm(week);
  // Normalised on-screen uterus height; k = scene units per real cm inside the womb.
  const Hd = 0.9 + (1.3 * (Lcm - 7.5)) / 27.5;
  const k = Hd / Lcm;
  const rx = Hd * 0.4;
  const rz = Hd * 0.36;
  const cy = BASE_Y + 0.12 + Hd / 2;
  // Curled fetus: crown-heel length folds to about 60% of itself; never wider than the womb.
  const extent = Math.min(Hd * 0.78, Math.max(0.035, lengthCm * (week >= 20 ? 0.6 : 1) * k));
  const head = extent * (week < 12 ? 0.42 : 0.3);
  const bodyR = extent * 0.28;
  const skin = p.dark ? "#fda4af" : "#fb7185";
  const fetusCenter: [number, number, number] = [0, cy - Hd * 0.08, 0.02];
  const placenta: [number, number, number] = [-rx * 0.55, cy + Hd * 0.3, -rz * 0.55];

  const cordA = new THREE.Vector3(fetusCenter[0], fetusCenter[1], fetusCenter[2] + bodyR * 0.6);
  const cordB = new THREE.Vector3(...placenta);
  const cordMid = cordA.clone().lerp(cordB, 0.5).add(new THREE.Vector3(rx * 0.35, -Hd * 0.1, rz * 0.4));
  const cord = new THREE.CatmullRomCurve3([cordA, cordMid, cordB]).getPoints(24).map((v) => [v.x, v.y, v.z] as [number, number, number]);

  const done = Math.min(ga, FULL_TERM);
  const rulerX = rx + 0.32;
  const top = cy + Hd / 2;
  const bottom = cy - Hd / 2;
  const tick = Lcm <= 15 ? 2 : 5;

  return (
    <group position={[0, 0.05, 0]}>
      {/* Base platform */}
      <mesh position={[0, BASE_Y - 0.06, 0]}>
        <cylinderGeometry args={[R_RING + 0.18, R_RING + 0.22, 0.08, 96]} />
        <meshStandardMaterial color={p.dark ? "#27272a" : "#e2e8f0"} roughness={0.8} />
      </mesh>

      {/* 40-week ring: faded trimester arcs, solid up to today */}
      {ACOG_TRI.map((z) => (
        <group key={z.n}>
          <Sector d0={z.from} len={z.to - z.from - 0.6} rIn={R_RING - RING_W} rOut={R_RING} depth={0.03} color={TRI_COLORS[z.n]} y={BASE_Y} opacity={0.3} />
          {done > z.from && <Sector d0={z.from} len={Math.min(done, z.to) - z.from - 0.6} rIn={R_RING - RING_W} rOut={R_RING} depth={0.09} color={TRI_COLORS[z.n]} y={BASE_Y} />}
          <Label3D position={at((z.from + z.to) / 2, R_RING + 0.2, BASE_Y + 0.05)} color={TRI_COLORS[z.n]} text={`T${z.n}`} fontSize={10} weight={800} />
        </group>
      ))}
      <Label3D position={at(0, R_RING + 0.2, BASE_Y + 0.05)} color={p.muted} text="0 | 40w" fontSize={9.5} />

      {/* Pin at today's gestational age */}
      <mesh position={at(done, R_RING - RING_W / 2, BASE_Y + 0.2)}>
        <cylinderGeometry args={[0.018, 0.018, 0.4, 12]} />
        <meshStandardMaterial color={p.warning} />
      </mesh>
      <mesh position={at(done, R_RING - RING_W / 2, BASE_Y + 0.42)}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color={p.warning} emissive={p.warning} emissiveIntensity={0.4} />
      </mesh>
      <Label3D position={at(done, R_RING - RING_W / 2, BASE_Y + 0.58)} color={p.primary} bg={bg} text={wd(ga)} weight={800} />

      {/* Cervix stalk */}
      <mesh position={[0, BASE_Y + 0.08, 0]}>
        <cylinderGeometry args={[rx * 0.28, rx * 0.36, 0.16, 32]} />
        <meshStandardMaterial color={p.dark ? "#be185d" : "#f9a8d4"} roughness={0.6} />
      </mesh>

      {/* Uterus wall (translucent) and amniotic fluid */}
      <mesh position={[0, cy, 0]} scale={[rx, Hd / 2, rz]}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color={p.dark ? "#f472b6" : "#ec4899"} transparent opacity={0.22} roughness={0.35} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, cy, 0]} scale={[rx * 0.93, (Hd / 2) * 0.93, rz * 0.93]}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshStandardMaterial color={p.dark ? "#38bdf8" : "#7dd3fc"} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Placenta and cord */}
      <mesh position={placenta} scale={[rx * 0.5, Hd * 0.06, rz * 0.45]} rotation={[0.5, 0.4, 0.5]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={p.dark ? "#e11d48" : "#be123c"} roughness={0.7} />
      </mesh>
      {week >= 6 && <Line points={cord} color={p.dark ? "#fda4af" : "#e11d48"} lineWidth={2} />}

      {/* Fetus: curled body, head, limb buds */}
      <group position={fetusCenter} rotation={[0, 0, -0.35]}>
        <mesh position={[0, -extent * 0.12, 0]} scale={[bodyR, extent * 0.36, bodyR * 0.9]}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <mesh position={[extent * 0.08, extent * 0.3, extent * 0.04]}>
          <sphereGeometry args={[head, 28, 28]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {week >= 8 &&
          [
            [bodyR * 0.9, -extent * 0.05, 0.4],
            [-bodyR * 0.9, -extent * 0.05, -0.4],
            [bodyR * 0.7, -extent * 0.4, 0.9],
            [-bodyR * 0.7, -extent * 0.4, -0.9],
          ].map(([x, y, r], i) => (
            <mesh key={i} position={[x, y, bodyR * 0.6]} rotation={[1.2, 0, r]}>
              <capsuleGeometry args={[bodyR * 0.22, extent * 0.22, 6, 12]} />
              <meshStandardMaterial color={skin} roughness={0.55} />
            </mesh>
          ))}
      </group>
      <Label3D position={[fetusCenter[0], fetusCenter[1], fetusCenter[2]]} offset={[0, -28]} color={p.text} bg={bg} border={skin} text={`${lengthCm} cm${weightG > 0 ? ` · ${weightG} g` : ""}`} fontSize={10.5} weight={800} />

      {/* Ruler: uterus length in real centimetres */}
      <Line points={[[rulerX, bottom, 0], [rulerX, top, 0]]} color={p.muted} lineWidth={1.5} />
      {Array.from({ length: Math.floor(Lcm / tick) + 1 }, (_, i) => (
        <Line key={i} points={[[rulerX - 0.04, bottom + i * tick * k, 0], [rulerX + 0.04, bottom + i * tick * k, 0]]} color={p.muted} lineWidth={1} />
      ))}
      <Line points={[[rx * 0.2, top, 0], [rulerX + 0.08, top, 0]]} color={p.primary} lineWidth={1.5} dashed dashSize={0.04} gapSize={0.03} />
      <Label3D position={[rulerX, top, 0]} offset={[0, 14]} color={p.primary} bg={bg} text={`≈ ${Math.round(Lcm)} cm`} />
    </group>
  );
}
