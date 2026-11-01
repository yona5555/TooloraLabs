"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMotionEpisode } from "@/components/tool-ui/motion/motion";
import { useSceneFrame } from "@/components/tool-ui/motion/scene-motion";
import { Line } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * Two energy towers on one floor, drawn to the same kcal scale: "out" stacks the four parts of
 * TDEE (BMR, TEF, NEAT, EAT) and "in" is the daily calorie target. A ring marks maintenance
 * (TDEE) across both, and the gap between the target and that ring glows as the daily deficit
 * (red) or surplus (green). Sparks rise out of the "out" tower at a pace set by the activity.
 * Reduced motion: drawn still. Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type TDEEEnergyScene3DProps = {
  parts: { key: string; kcal: number; color: string; label: string }[];
  tdee: number;
  intake: number;
  intakeColor: string;
  /** Activity multiplier: sets the pace of the rising sparks. */
  multiplier: number;
  labels: { tdee: string; intake: string; gap: string };
};

const R = 0.4;
const XO = -0.55;
const XI = 0.55;
const HMAX = 2.25;
const SPARKS = 14;
const MOVE_SECONDS = 8; // the sparks rise this long after the data changes, never on load, so an idle page draws nothing

export default function TDEEEnergyScene3D({ parts, tdee, intake, intakeColor, multiplier, labels }: TDEEEnergyScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  const sparks = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const { active } = useMotionEpisode([tdee, intake, multiplier]);
  const scale = HMAX / Math.max(1, tdee, intake);
  const hT = tdee * scale;
  const hI = intake * scale;
  const gap = intake - tdee;
  const gapColor = gap < 0 ? p.danger : p.positive;
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const speed = 0.25 + (multiplier - 1.2) * 0.9;

  useEffect(() => {
    invalidate();
  }, [invalidate, tdee, intake, multiplier]);

  // sparks rise during a motion episode after the energy numbers change (tool-ui/motion), else rest in place
  useSceneFrame((_, dt) => {
    const g = sparks.current;
    if (!g) return;
    clock.current += dt;
    const t = clock.current;
    g.children.forEach((c, i) => {
      const f = (i / SPARKS + t * speed * 0.35) % 1;
      const a = i * 2.4 + t * 0.6;
      c.position.set(XO + Math.cos(a) * (R + 0.08), hT + 0.05 + f * 0.75, Math.sin(a) * (R + 0.08));
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.85 * (1 - f);
    });
  }, active);

  const hs = parts.map((part) => Math.max(0, part.kcal * scale));
  const stack = parts.map((part, i) => ({ ...part, y0: hs.slice(0, i).reduce((a, b) => a + b, 0), h: hs[i] }));

  return (
    <group position={[0, -1.2, 0]}>
      {/* Floor */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.01, 64]} />
        <meshStandardMaterial color={p.grid} transparent opacity={0.55} />
      </mesh>

      {/* Out tower: BMR, TEF, NEAT, EAT stacked */}
      {stack.map((s) =>
        s.h > 0.004 ? (
          <mesh key={s.key} position={[XO, s.y0 + s.h / 2, 0]}>
            <cylinderGeometry args={[R, R, Math.max(0.002, s.h - 0.012), 48]} />
            <meshStandardMaterial color={s.color} roughness={0.45} metalness={0.05} />
          </mesh>
        ) : null,
      )}
      {stack.map((s) =>
        s.h > 0.12 ? <Label3D key={`l${s.key}`} position={[XO - R, s.y0 + s.h / 2, 0]} align="right" offset={[-6, 0]} color={p.text} bg={bg} text={s.label} fontSize={11} /> : null,
      )}

      {/* In tower: the daily target */}
      <mesh position={[XI, hI / 2, 0]}>
        <cylinderGeometry args={[R, R, Math.max(0.002, hI), 48]} />
        <meshStandardMaterial color={intakeColor} roughness={0.45} metalness={0.05} />
      </mesh>
      {Math.abs(gap) * scale > 0.01 && (
        <mesh position={[XI, (hI + hT) / 2, 0]}>
          <cylinderGeometry args={[R + 0.02, R + 0.02, Math.abs(hT - hI), 48]} />
          <meshStandardMaterial color={gapColor} transparent opacity={0.32} depthWrite={false} />
        </mesh>
      )}

      {/* Maintenance ring across both towers */}
      <Line points={[[XO - R - 0.15, hT, 0], [XI + R + 0.15, hT, 0]]} color={p.text} lineWidth={2} dashed dashSize={0.06} gapSize={0.04} />
      <Label3D position={[XO, hT, 0]} offset={[0, 30]} color={p.primary} bg={bg} text={labels.tdee} weight={800} />
      <Label3D position={[XI + R, hI, 0]} align="left" offset={[6, 0]} color={p.text} bg={bg} text={labels.intake} weight={800} />
      {Math.abs(gap) >= 1 && <Label3D position={[XI + R, (hI + hT) / 2, 0]} align="left" offset={[6, -18]} color={gapColor} bg={bg} text={labels.gap} />}

      {/* Rising sparks: energy spent, faster with more activity */}
      <group ref={sparks}>
        {Array.from({ length: SPARKS }, (_, i) => (
          <mesh key={i} position={[XO, hT, 0]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshBasicMaterial color={parts[parts.length - 1]?.color ?? p.warning} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
