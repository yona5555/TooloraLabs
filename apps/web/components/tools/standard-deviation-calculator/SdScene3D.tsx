"use client";

import { DoubleSide } from "three";
import Label3D from "@/components/tool-ui/three/Label3D";
import type { ReactNode } from "react";
import { normalPdf, type SpreadAnalysis } from "@tooloralabs/tools";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import { bandOf } from "./SdLiveContext";

export type SdScene3DProps = { a: SpreadAnalysis; fmt: (n: number) => string; pct: (share: number) => string };

const WIDTH = 6.4;
const BELL_H = 2.2;
const Y0 = -1.2;
const COLS = 64;
const SQUARE_Z = 0.85;

function Label({ position, color, children, bold = false }: { position: [number, number, number]; color: string; children: ReactNode; bold?: boolean }) {
  return (
    <Label3D position={position} color={color} weight={bold ? 700 : 500}>
        {children}
      </Label3D>
  );
}

/**
 * Heavy part of the live 3D drawing (only loaded through next/dynamic inside Scene3D): a normal
 * bell built from the data's μ and σ as 64 columns coloured by σ band (±1σ, ±2σ, ±3σ, beyond),
 * each value as a sphere on the floor, and each squared deviation as a real square standing
 * between the value and the mean — the variance is the average area of those squares.
 */
export default function SdScene3D({ a, fmt, pct }: SdScene3DProps) {
  const p = usePalette3D();
  const sigma = a.populationStdDev;
  const flat = sigma === 0;
  const lo = flat ? a.mean - 1 : Math.min(a.mean - 3.5 * sigma, a.min);
  const hi = flat ? a.mean + 1 : Math.max(a.mean + 3.5 * sigma, a.max);
  const sx = (v: number) => ((v - lo) / (hi - lo) - 0.5) * WIDTH;
  const bandColor = [p.positive, p.warning, p.danger, p.muted];
  const colW = WIDTH / COLS;
  const peak = flat ? 1 : normalPdf(0);

  const seen = new Map<number, number>();
  const r = Math.max(0.06, Math.min(0.14, WIDTH / Math.max(8, a.n) / 3));
  const mx = sx(a.mean);

  return (
    <group>
      {/* floor */}
      <mesh position={[0, Y0 - 0.05, 0]}>
        <boxGeometry args={[WIDTH + 0.8, 0.04, 2.6]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>

      {/* normal bell from μ and σ, coloured by band */}
      {!flat &&
        Array.from({ length: COLS }, (_, i) => {
          const v = lo + ((i + 0.5) / COLS) * (hi - lo);
          const z = (v - a.mean) / sigma;
          const h = Math.max(0.01, (normalPdf(z) / peak) * BELL_H);
          return (
            <mesh key={i} position={[sx(v), Y0 + h / 2, -0.55]}>
              <boxGeometry args={[colW * 0.9, h, 0.7]} />
              <meshStandardMaterial color={bandColor[bandOf(z)]} transparent opacity={0.8} roughness={0.5} />
            </mesh>
          );
        })}

      {/* σ ticks */}
      {!flat &&
        [-3, -2, -1, 1, 2, 3].map((k) => (
          <Label key={k} position={[sx(a.mean + k * sigma), Y0 - 0.2, 1.45]} color={bandColor[Math.min(3, Math.abs(k) - 1)]} bold>
            {`${k > 0 ? "+" : "−"}${Math.abs(k)}σ`}
          </Label>
        ))}

      {/* mean line */}
      <mesh position={[mx, Y0 + (BELL_H + 0.5) / 2, 0]}>
        <boxGeometry args={[0.03, BELL_H + 0.5, 0.03]} />
        <meshBasicMaterial color={p.primary} />
      </mesh>
      <Label position={[mx, Y0 + BELL_H + 0.75, 0]} color={p.primary} bold>
        {`μ = ${fmt(a.mean)} · σ = ${fmt(sigma)}`}
      </Label>
      <Label position={[mx, Y0 + BELL_H + 0.45, 0]} color={p.text}>
        {a.bands.map((b) => `±${b.k}σ ${pct(b.actualShare)}`).join(" · ")}
      </Label>

      {/* squared deviations as real squares, and the values as spheres */}
      {a.points.map((pt) => {
        const level = seen.get(pt.value) ?? 0;
        seen.set(pt.value, level + 1);
        const x = sx(pt.value);
        const side = Math.abs(x - mx);
        const color = bandColor[bandOf(pt.z)];
        return (
          <group key={pt.index}>
            {side > 0.01 && (
              <mesh position={[(x + mx) / 2, Y0 + side / 2, SQUARE_Z]}>
                <planeGeometry args={[side, side]} />
                <meshStandardMaterial color={color} transparent opacity={0.14} side={DoubleSide} depthWrite={false} />
              </mesh>
            )}
            <mesh position={[x, Y0 + r + level * r * 2.1, SQUARE_Z + 0.05]}>
              <sphereGeometry args={[r, 24, 16]} />
              <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
            </mesh>
          </group>
        );
      })}

      {/* farthest value annotated with its squared deviation */}
      <Label position={[sx(a.farthest.value), Y0 + Math.abs(sx(a.farthest.value) - mx) + 0.2, SQUARE_Z]} color={bandColor[bandOf(a.farthest.z)]} bold>
        {`(${fmt(a.farthest.deviation)})² = ${fmt(a.farthest.squaredDeviation)}`}
      </Label>
    </group>
  );
}
