"use client";

import { DoubleSide } from "three";
import Label3D from "@/components/tool-ui/three/Label3D";
import type { ReactNode } from "react";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import type { StatsHistogramBin } from "@tooloralabs/tools";

export type StatisticsScene3DProps = {
  bins: StatsHistogramBin[];
  maxCount: number;
  mean: number;
  median: number;
  meanLabel: string;
  medianLabel: string;
  countLabel: string;
  fmt: (n: number) => string;
};

const WIDTH = 6;
const MAX_H = 2.6;
const DEPTH = 1;
const Y0 = -1.3;

function Label({ position, color, children, bold = false }: { position: [number, number, number]; color: string; children: ReactNode; bold?: boolean }) {
  return (
    <Label3D position={position} color={color} weight={bold ? 700 : 500}>
        {children}
      </Label3D>
  );
}

/** Heavy part of the statistics live 3D drawing; only loaded through next/dynamic inside Scene3D. */
export default function StatisticsScene3D({ bins, maxCount, mean, median, meanLabel, medianLabel, countLabel, fmt }: StatisticsScene3DProps) {
  const p = usePalette3D();
  if (bins.length === 0) return null;
  const lo = bins[0].start;
  const hi = bins[bins.length - 1].end;
  const span = hi - lo || 1;
  const sx = (v: number) => ((v - lo) / span - 0.5) * WIDTH;
  const sh = (c: number) => (maxCount > 0 ? (c / maxCount) * MAX_H : 0);
  const planeH = MAX_H + 0.6;
  const near = Math.abs(sx(mean) - sx(median)) < 0.5;

  return (
    <group>
      {/* floor */}
      <mesh position={[0, Y0 - 0.03, 0]}>
        <boxGeometry args={[WIDTH + 0.6, 0.05, DEPTH + 1.2]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {/* count gridlines on the back wall */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <group key={f}>
          <mesh position={[0, Y0 + f * MAX_H, -DEPTH / 2 - 0.55]}>
            <boxGeometry args={[WIDTH + 0.6, 0.01, 0.01]} />
            <meshBasicMaterial color={p.muted} transparent opacity={0.5} />
          </mesh>
          <Label position={[-WIDTH / 2 - 0.55, Y0 + f * MAX_H, -DEPTH / 2 - 0.55]} color={p.muted}>
            {fmt(Math.round(f * maxCount * 100) / 100)}
          </Label>
        </group>
      ))}
      <Label position={[-WIDTH / 2 - 0.55, Y0 + MAX_H + 0.35, -DEPTH / 2 - 0.55]} color={p.muted}>
        {countLabel}
      </Label>

      {bins.map((b, i) => {
        const x0 = sx(b.start);
        const x1 = sx(b.end);
        const w = Math.max(0.05, (x1 - x0) * 0.88);
        const h = Math.max(0.02, sh(b.count));
        const color = p.faces[i % p.faces.length];
        return (
          <group key={i}>
            <mesh position={[(x0 + x1) / 2, Y0 + h / 2, 0]}>
              <boxGeometry args={[w, h, DEPTH]} />
              <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
            </mesh>
            <Label position={[(x0 + x1) / 2, Y0 + h + 0.22, 0]} color={p.text} bold>
              {String(b.count)}
            </Label>
          </group>
        );
      })}

      {/* bin edges along the front of the floor */}
      {[...bins.map((b) => b.start), hi].map((edge, i) => (
        <Label key={i} position={[sx(edge), Y0 - 0.28, DEPTH / 2 + 0.45]} color={p.muted}>
          {fmt(edge)}
        </Label>
      ))}

      {/* mean and median planes */}
      {[
        { v: mean, color: p.primary, label: meanLabel },
        { v: median, color: p.positive, label: medianLabel },
      ].map((m, i) => (
        <group key={i}>
          <mesh position={[sx(m.v), Y0 + planeH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[DEPTH + 0.8, planeH]} />
            <meshStandardMaterial color={m.color} transparent opacity={0.22} side={DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[sx(m.v), Y0 + planeH / 2, 0]}>
            <boxGeometry args={[0.025, planeH, 0.025]} />
            <meshBasicMaterial color={m.color} />
          </mesh>
          <Label position={[sx(m.v), Y0 + planeH + 0.18 + (near && i === 1 ? 0.32 : 0), 0]} color={m.color} bold>
            {`${m.label} ${fmt(m.v)}`}
          </Label>
        </group>
      ))}
    </group>
  );
}
