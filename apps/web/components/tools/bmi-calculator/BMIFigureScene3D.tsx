"use client";

import type { ReactNode } from "react";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * A human figure built from capsules and spheres, drawn in metres: its height is the real
 * height, its girth follows √(BMI / 22) and the belly grows above BMI 23, so the same weight
 * looks heavier on a shorter body. The whole body takes the WHO band colour. An optional
 * translucent fat layer wraps the trunk and limbs (body-fat calculator).
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type BMIFigureScene3DProps = {
  heightCm: number;
  bmi: number;
  color: string;
  labels: { height: string; bmi: string; weight: string };
  /**
   * Optional translucent fat layer (used by the body-fat calculator): a second shell around the
   * trunk and limbs whose extra girth is `thickness` (a fraction of the lean girth) in `color`.
   * Left out, the BMI figure renders exactly as before.
   */
  fatLayer?: { thickness: number; color: string; opacity?: number };
};

const BASE = 1.7;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function BMIFigureScene3D({ heightCm, bmi, color, labels, fatLayer }: BMIFigureScene3DProps) {
  const p = usePalette3D();
  const H = clamp(heightCm / 100, 0.5, 2.5);
  const s = H / BASE;
  const k = clamp(Math.sqrt(bmi / 22), 0.7, 1.9);
  const belly = clamp((bmi - 23) / 15, 0, 1.3);
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const mat = <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />;
  const legX = 0.07 + 0.03 * k;
  const armX = 0.17 * k + 0.07;

  return (
    <group position={[0, -1.15, 0]}>
      {/* Floor disc and the height ruler (true metres). */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.01, 64]} />
        <meshStandardMaterial color={p.grid} transparent opacity={0.6} />
      </mesh>
      <Line points={[[0.62, 0, 0], [0.62, H, 0]]} color={p.muted} lineWidth={1.5} />
      {Array.from({ length: Math.floor(H / 0.25) + 1 }, (_, i) => (
        <Line key={i} points={[[0.58, i * 0.25, 0], [0.66, i * 0.25, 0]]} color={p.muted} lineWidth={1} />
      ))}
      <Line points={[[0.4, H, 0], [0.7, H, 0]]} color={p.primary} lineWidth={2} />
      <Label3D position={[0.62, H, 0]} offset={[0, 14]} color={p.primary} bg={bg} text={labels.height} />

      <group scale={[s, s, s]}>
        <BodyParts k={k} belly={belly} legX={legX} armX={armX} mat={mat} g={0} shell={false} />
        {fatLayer && (
          <BodyParts
            k={k}
            belly={belly}
            legX={legX}
            armX={armX}
            g={clamp(fatLayer.thickness, 0, 1.2)}
            shell
            mat={<meshStandardMaterial color={fatLayer.color} roughness={0.35} metalness={0} transparent opacity={fatLayer.opacity ?? 0.38} depthWrite={false} />}
          />
        )}
      </group>

      <Label3D position={[0, H, 0]} offset={[0, 22]} color={p.text} bg={bg} text={labels.bmi} />
      <Label3D position={[-(armX + 0.1) * s, H * 0.5, 0]} align="right" color={p.text} bg={bg} text={labels.weight} />
    </group>
  );
}

/**
 * The trunk and limbs (plus feet, neck and head on the solid body). `g` widens every part by
 * (1 + g) around its own axis for the fat shell; at g = 0 the geometry is the original figure.
 */
function BodyParts({ k, belly, legX, armX, mat, g, shell }: { k: number; belly: number; legX: number; armX: number; mat: ReactNode; g: number; shell: boolean }) {
  const w = 1 + g;
  return (
    <>
      {/* Feet (solid body only) */}
      {!shell &&
        [-1, 1].map((d) => (
          <mesh key={`f${d}`} position={[d * legX, 0.03, 0.04]}>
            <boxGeometry args={[0.09 * k, 0.06, 0.24]} />
            {mat}
          </mesh>
        ))}
      {/* Legs */}
      {[-1, 1].map((d) => (
        <mesh key={`l${d}`} position={[d * legX, 0.46, 0]} scale={[k * w, 1, k * w]}>
          <capsuleGeometry args={[0.062, 0.68, 8, 16]} />
          {mat}
        </mesh>
      ))}
      {/* Hips */}
      <mesh position={[0, 0.86, 0]} scale={[0.19 * k * w, 0.12 * (1 + g * 0.4), 0.13 * k * w]}>
        <sphereGeometry args={[1, 32, 16]} />
        {mat}
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.13, 0]} scale={[1.05 * k * w, 1 + g * 0.15, 0.72 * k * w]}>
        <capsuleGeometry args={[0.15, 0.36, 8, 24]} />
        {mat}
      </mesh>
      {/* Belly: grows forward with BMI above 23 */}
      <mesh position={[0, 1.0, 0.05 * k + 0.07 * belly]} scale={[0.15 * k * w, 0.15 * (0.9 + 0.35 * belly) * w, 0.1 * k * (0.6 + 0.9 * belly) * w]}>
        <sphereGeometry args={[1, 32, 16]} />
        {mat}
      </mesh>
      {/* Arms */}
      {[-1, 1].map((d) => (
        <mesh key={`a${d}`} position={[d * armX, 1.1, 0]} rotation={[0, 0, d * 0.12]} scale={[k * w, 1, k * w]}>
          <capsuleGeometry args={[0.042, 0.52, 8, 16]} />
          {mat}
        </mesh>
      ))}
      {/* Neck and head (solid body only) */}
      {!shell && (
        <>
          <mesh position={[0, 1.44, 0]}>
            <cylinderGeometry args={[0.048 * Math.sqrt(k), 0.055 * Math.sqrt(k), 0.1, 16]} />
            {mat}
          </mesh>
          <mesh position={[0, 1.57, 0]} scale={[Math.sqrt(k), 1, Math.sqrt(k)]}>
            <sphereGeometry args={[0.11, 32, 16]} />
            {mat}
          </mesh>
        </>
      )}
    </>
  );
}
