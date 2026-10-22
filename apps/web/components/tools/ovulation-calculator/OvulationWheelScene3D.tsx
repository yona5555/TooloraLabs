"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { PHASE_COLORS, phaseOf, wilcoxOf } from "./ovulation";

/**
 * A 3D cycle wheel: one tile per day of the cycle laid round a ring, clockwise from day 1 at
 * twelve o'clock. Tiles take their phase colour (period, follicular, fertile window, ovulation,
 * luteal); fertile-window tiles rise as columns whose height is the Wilcox 1995 chance of
 * conception for that day, and the ovulation tile carries an egg. A clock hand from the hub points
 * at today; days already past in this cycle stand solid, the days ahead are paler. Labels hold
 * numbers only. Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type OvulationWheelScene3DProps = {
  cycle: number;
  /** 0-based day of ovulation (cycle − luteal). */
  ovOffset: number;
  /** Today's 0-based day in its cycle. */
  todayIdx: number;
  ovLabel: string;
  todayLabel: string;
};

const R = 1.15;
const BASE = 0.06;
const COL_H = 1.25;

export default function OvulationWheelScene3D({ cycle, ovOffset, todayIdx, ovLabel, todayLabel }: OvulationWheelScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, cycle, ovOffset, todayIdx, p.dark]);

  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const step = (2 * Math.PI) / cycle;
  /** Angle of day i: day 1 at the top (−z), going clockwise seen from above. */
  const ang = (i: number) => (i + 0.5) * step;
  const pos = (i: number, r = R): [number, number] => [r * Math.sin(ang(i)), -r * Math.cos(ang(i))];
  const tileW = Math.min(0.2, 2 * R * Math.sin(step / 2) * 0.86);
  const hub = p.dark ? "#27272a" : "#e2e8f0";
  const [ox, oz] = pos(ovOffset);
  const ovH = BASE + wilcoxOf(0) * COL_H;
  const [tx, tz] = pos(todayIdx, R - 0.32);
  const [lx, lz] = pos(todayIdx, R + 0.3);

  return (
    <group position={[0, -0.35, 0]}>
      {/* Dial plate */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[R + 0.28, R + 0.28, 0.05, 72]} />
        <meshStandardMaterial color={p.dark ? "#1f2937" : "#f1f5f9"} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[R - 0.2, R - 0.2, 0.03, 72]} />
        <meshStandardMaterial color={hub} roughness={0.8} />
      </mesh>

      {/* Day tiles (columns in the fertile window) */}
      {Array.from({ length: cycle }, (_, i) => {
        const ph = phaseOf(i, ovOffset);
        const color = PHASE_COLORS[ph];
        const h = ph === "fertile" || ph === "ovulation" ? Math.max(BASE, BASE + wilcoxOf(i - ovOffset) * COL_H) : BASE;
        const [x, z] = pos(i);
        const past = i < todayIdx;
        const isToday = i === todayIdx;
        return (
          <mesh key={i} position={[x, h / 2, z]} rotation={[0, -ang(i), 0]}>
            <boxGeometry args={[tileW, h, 0.26]} />
            <meshStandardMaterial
              color={color}
              transparent={!past && !isToday}
              opacity={past || isToday ? 1 : p.dark ? 0.55 : 0.5}
              emissive={isToday ? color : "#000000"}
              emissiveIntensity={isToday ? 0.45 : 0}
              roughness={0.45}
            />
          </mesh>
        );
      })}

      {/* Egg above the ovulation column */}
      <mesh position={[ox, ovH + 0.12, oz]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#fde68a" emissive={PHASE_COLORS.ovulation} emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      <Label3D position={[ox, ovH + 0.36, oz]} color={p.warning} bg={bg} text={`${ovOffset + 1} · ${ovLabel}`} weight={800} fontSize={11} />

      {/* Day numbers: 1 and the last day */}
      {[0, cycle - 1].map((i) => {
        const [x, z] = pos(i, R + 0.2);
        return <Label3D key={`n${i}`} position={[x, 0.08, z]} color={p.muted} text={String(i + 1)} fontSize={10} weight={700} />;
      })}

      {/* Hub and the clock hand pointing at today */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 24]} />
        <meshStandardMaterial color={p.primary} />
      </mesh>
      <mesh position={[tx / 2, 0.08, tz / 2]} rotation={[0, -ang(todayIdx), 0]}>
        <boxGeometry args={[0.04, 0.03, Math.hypot(tx, tz)]} />
        <meshStandardMaterial color={p.primary} emissive={p.primary} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[tx, 0.08, tz]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={p.primary} emissive={p.primary} emissiveIntensity={0.4} />
      </mesh>
      <Label3D position={[lx, 0.25, lz]} color={p.primary} bg={bg} text={`${todayIdx + 1} · ${todayLabel}`} weight={800} fontSize={11} />
    </group>
  );
}
