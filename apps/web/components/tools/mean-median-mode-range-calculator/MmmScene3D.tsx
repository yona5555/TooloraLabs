"use client";

import { DoubleSide } from "three";
import { Html } from "@react-three/drei";
import type { ReactNode } from "react";
import type { MmmAnalysis } from "@tooloralabs/tools";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

export type MmmScene3DProps = {
  a: MmmAnalysis;
  labels: { mean: string; median: string; mode: string; range: string; iqr: string; frequency: string };
  fmt: (n: number) => string;
};

const WIDTH = 6;
const MAX_H = 2.6;
const Y0 = -1.2;

function Label({ position, color, children, bold = false }: { position: [number, number, number]; color: string; children: ReactNode; bold?: boolean }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <span style={{ color, fontSize: 11, fontWeight: bold ? 700 : 500, whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{children}</span>
    </Html>
  );
}

/**
 * Heavy part of the live 3D drawing (only loaded through next/dynamic inside Scene3D): every
 * distinct value is a stack of balls on a number line (stack height = frequency), the mode stacks
 * glow amber, Tukey outliers red, the mean is the cone the line balances on, the median a green
 * plane, and the IQR box and range bracket lie on the floor.
 */
export default function MmmScene3D({ a, labels, fmt }: MmmScene3DProps) {
  const p = usePalette3D();
  const span = a.range || 1;
  const lo = a.range ? a.min : a.min - 0.5;
  const sx = (v: number) => ((v - lo) / span - 0.5) * WIDTH * (a.range ? 1 : 0);
  const gaps = a.frequencies.slice(1).map((fr, i) => Math.abs(sx(fr.value) - sx(a.frequencies[i].value)));
  const minGap = gaps.length ? Math.min(...gaps) : 1;
  const r = Math.max(0.05, Math.min(0.2, minGap * 0.45, MAX_H / a.maxFrequency / 2.2));
  const step = r * 2.1;
  const modeSet = new Set(a.modes);
  const outSet = new Set(a.outliers);
  const near = Math.abs(sx(a.mean) - sx(a.median)) < 0.7;
  const planeH = Math.max(a.maxFrequency * step + 0.5, 1.6);

  return (
    <group>
      {/* floor */}
      <mesh position={[0, Y0 - 0.05, 0]}>
        <boxGeometry args={[WIDTH + 1, 0.04, 2.2]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {/* IQR box on the floor */}
      {a.iqr > 0 && (
        <mesh position={[(sx(a.q1) + sx(a.q3)) / 2, Y0 - 0.01, 0]}>
          <boxGeometry args={[sx(a.q3) - sx(a.q1), 0.05, 1.1]} />
          <meshStandardMaterial color={p.accent} transparent opacity={0.35} />
        </mesh>
      )}
      {a.iqr > 0 && (
        <Label position={[(sx(a.q1) + sx(a.q3)) / 2, Y0 - 0.02, -0.75]} color={p.accent} bold>
          {`${labels.iqr} ${fmt(a.iqr)}`}
        </Label>
      )}
      {/* number line (the beam) */}
      <mesh position={[0, Y0 + 0.04, 0]}>
        <boxGeometry args={[WIDTH + 0.4, 0.06, 0.12]} />
        <meshStandardMaterial color={p.muted} />
      </mesh>
      {/* mean fulcrum */}
      <mesh position={[sx(a.mean), Y0 - 0.2, 0]}>
        <coneGeometry args={[0.2, 0.32, 24]} />
        <meshStandardMaterial color={p.primary} />
      </mesh>

      {a.frequencies.map((fr) => {
        const color = outSet.has(fr.value) ? p.danger : modeSet.has(fr.value) ? p.warning : p.faces[0];
        return (
          <group key={fr.value}>
            {Array.from({ length: fr.count }, (_, k) => (
              <mesh key={k} position={[sx(fr.value), Y0 + 0.07 + r + k * step, 0]}>
                <sphereGeometry args={[r, 24, 16]} />
                <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
              </mesh>
            ))}
            <Label position={[sx(fr.value), Y0 + 0.07 + fr.count * step + 0.18, 0]} color={color} bold>
              {`×${fr.count}`}
            </Label>
            <Label position={[sx(fr.value), Y0 - 0.32, 0.8]} color={p.text}>
              {fmt(fr.value)}
            </Label>
          </group>
        );
      })}

      {/* range bracket along the front edge */}
      <mesh position={[(sx(a.min) + sx(a.max)) / 2, Y0 - 0.02, 1.0]}>
        <boxGeometry args={[Math.max(0.02, sx(a.max) - sx(a.min)), 0.03, 0.05]} />
        <meshBasicMaterial color={p.positive} />
      </mesh>
      <Label position={[(sx(a.min) + sx(a.max)) / 2, Y0 - 0.02, 1.35]} color={p.positive} bold>
        {`${labels.range} ${fmt(a.max)} − ${fmt(a.min)} = ${fmt(a.range)}`}
      </Label>

      {/* mean and median planes */}
      {[
        { v: a.mean, color: p.primary, label: labels.mean },
        { v: a.median, color: p.positive, label: labels.median },
      ].map((m, i) => (
        <group key={i}>
          <mesh position={[sx(m.v), Y0 + planeH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.4, planeH]} />
            <meshStandardMaterial color={m.color} transparent opacity={0.16} side={DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[sx(m.v), Y0 + planeH / 2, 0]}>
            <boxGeometry args={[0.025, planeH, 0.025]} />
            <meshBasicMaterial color={m.color} />
          </mesh>
          <Label position={[sx(m.v), Y0 + planeH + 0.2 + (near && i === 1 ? 0.32 : 0), 0]} color={m.color} bold>
            {`${m.label} ${fmt(m.v)}`}
          </Label>
        </group>
      ))}

      {a.modes.length > 0 && (
        <Label position={[0, Y0 + planeH + 0.85, 0]} color={p.warning} bold>
          {`${labels.mode} ${a.modes.map(fmt).join(", ")} · ${labels.frequency} ${a.maxFrequency}`}
        </Label>
      )}
    </group>
  );
}
