"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import Label3D from "@/components/tool-ui/three/Label3D";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { TRIMESTERS, ZONES, trimesterOf } from "./dueDate";

/**
 * A 42-week board-game path: one stone per week since the LMP, laid in six rows of seven that
 * snake back and forth (row 1 = weeks 0–6 … row 6 = weeks 35–41). Stones take their trimester
 * colour; weeks already lived stand raised and solid, the current week fills in day by day and
 * carries a pin, the weeks ahead are low and pale. The ACOG term window (37–41) sits on a green
 * plate and a flag marks the due date at week 40. Labels hold numbers only.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 */
export type DueDatePathScene3DProps = {
  /** Gestational age today in days. */
  ga: number;
  gaLabel: string;
  dueLabel: string;
  todayLabel: string;
};

const COLS = 7;
const ROWS = 6;
const DX = 0.44;
const DZ = 0.52;
const S = 0.34;

/** Stone centre for week w (0–41) on the snaking path. */
function stone(w: number): [number, number] {
  const r = Math.floor(w / COLS);
  const c = w % COLS;
  const col = r % 2 === 0 ? c : COLS - 1 - c;
  return [(col - (COLS - 1) / 2) * DX, (r - (ROWS - 1) / 2) * DZ];
}

export default function DueDatePathScene3D({ ga, gaLabel, dueLabel, todayLabel }: DueDatePathScene3DProps) {
  const p = usePalette3D();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, ga, p.dark]);

  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const cur = Math.min(41, Math.floor(ga / 7));
  const into = ga >= 42 * 7 ? 7 : (ga % 7) + 1;
  const pale = p.dark ? "#3f3f46" : "#e2e8f0";
  const [cx, cz] = stone(cur);
  const [fx, fz] = stone(40);

  return (
    <group position={[0, -0.25, 0.1]}>
      {/* Board */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[COLS * DX + 0.3, 0.06, ROWS * DZ + 0.3]} />
        <meshStandardMaterial color={p.dark ? "#1f2937" : "#f1f5f9"} roughness={0.85} />
      </mesh>

      {/* Path links between consecutive weeks */}
      {Array.from({ length: 41 }, (_, w) => {
        const [x0, z0] = stone(w);
        const [x1, z1] = stone(w + 1);
        const done = w < cur;
        return (
          <mesh key={`k${w}`} position={[(x0 + x1) / 2, -0.005, (z0 + z1) / 2]}>
            <boxGeometry args={[Math.abs(x1 - x0) + 0.06, 0.03, Math.abs(z1 - z0) + 0.06]} />
            <meshStandardMaterial color={done ? TRIMESTERS[trimesterOf(w * 7) - 1].color : pale} roughness={0.7} />
          </mesh>
        );
      })}

      {/* Term window plate (weeks 37–41) */}
      {[37, 38, 39, 40, 41].map((w) => {
        const [x, z] = stone(w);
        const zone = ZONES.find((zz) => w * 7 >= zz.from && w * 7 < zz.to) ?? ZONES[2];
        return (
          <mesh key={`t${w}`} position={[x, -0.01, z]}>
            <boxGeometry args={[S + 0.1, 0.02, S + 0.1]} />
            <meshStandardMaterial color={zone.color} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Week stones */}
      {Array.from({ length: 42 }, (_, w) => {
        const [x, z] = stone(w);
        const color = TRIMESTERS[trimesterOf(w * 7) - 1].color;
        if (w < cur) {
          return (
            <mesh key={w} position={[x, 0.07, z]}>
              <boxGeometry args={[S, 0.14, S]} />
              <meshStandardMaterial color={color} roughness={0.45} />
            </mesh>
          );
        }
        if (w === cur) {
          const h = 0.04 + (into / 7) * 0.22;
          return (
            <group key={w}>
              <mesh position={[x, 0.02, z]}>
                <boxGeometry args={[S, 0.04, S]} />
                <meshStandardMaterial color={pale} />
              </mesh>
              <mesh position={[x, h / 2, z]}>
                <boxGeometry args={[S * 0.9, h, S * 0.9]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} />
              </mesh>
            </group>
          );
        }
        return (
          <mesh key={w} position={[x, 0.025, z]}>
            <boxGeometry args={[S, 0.05, S]} />
            <meshStandardMaterial color={color} transparent opacity={p.dark ? 0.35 : 0.3} roughness={0.8} />
          </mesh>
        );
      })}

      {/* Week numbers at the trimester starts and the term window */}
      {[0, 14, 28, 37].map((w) => {
        const [x, z] = stone(w);
        return <Label3D key={`n${w}`} position={[x, 0.2, z]} color={p.muted} text={String(w)} fontSize={10} weight={700} />;
      })}

      {/* Due-date flag on week 40 */}
      <mesh position={[fx, 0.35, fz]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 10]} />
        <meshStandardMaterial color={p.text} />
      </mesh>
      <mesh position={[fx + 0.11, 0.6, fz]}>
        <boxGeometry args={[0.22, 0.14, 0.01]} />
        <meshStandardMaterial color={p.positive} emissive={p.positive} emissiveIntensity={0.25} />
      </mesh>
      <Label3D position={[fx, 0.86, fz]} color={p.positive} bg={bg} text={`40+0 · ${dueLabel}`} weight={800} fontSize={11} />

      {/* Today's pin on the current week */}
      <mesh position={[cx, 0.42, cz]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 10]} />
        <meshStandardMaterial color={p.primary} />
      </mesh>
      <mesh position={[cx, 0.7, cz]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color={p.primary} emissive={p.primary} emissiveIntensity={0.4} />
      </mesh>
      <Label3D position={[cx, 0.92, cz]} color={p.primary} bg={bg} text={`${gaLabel} · ${todayLabel}`} weight={800} fontSize={11} />
    </group>
  );
}
