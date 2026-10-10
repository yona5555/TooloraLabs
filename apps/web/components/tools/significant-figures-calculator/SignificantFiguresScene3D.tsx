"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh, MeshStandardMaterial } from "three";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";
import type { DigitTower } from "@tooloralabs/tools";

export type SigFigTower = { label: string; tower: DigitTower; isResult: boolean };

export type SignificantFiguresScene3DProps = { towers: SigFigTower[] };

const BLOCK = 0.6;
const GAP = 0.1;
const ROW_GAP = 1.25;
const Y0 = -0.9;
const MAX_WIDTH = 6;

const height = (digit: string) => 0.35 + Number(digit) * 0.16;

function Label({ position, color, children, size = 12, opacity = 1 }: { position: [number, number, number]; color: string; children: ReactNode; size?: number; opacity?: number }) {
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <span style={{ color, opacity, fontSize: size, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{children}</span>
    </Html>
  );
}

/** A digit removed by rounding: translucent, slowly pulsing and sinking so it reads as fading away. */
function DroppedBlock({ x, z, h, color }: { x: number; z: number; h: number; color: string }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame((state) => {
    const k = (Math.sin(state.clock.elapsedTime * 1.8 + x) + 1) / 2;
    if (mat.current) mat.current.opacity = 0.12 + 0.28 * k;
    if (mesh.current) mesh.current.position.y = Y0 + h / 2 - 0.12 * (1 - k);
    state.invalidate();
  });
  return (
    <mesh ref={mesh} position={[x, Y0 + h / 2, z]}>
      <boxGeometry args={[BLOCK, h, BLOCK]} />
      <meshStandardMaterial ref={mat} color={color} transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

/** Heavy part of the significant-figures digit tower; only loaded through next/dynamic inside Scene3D. */
export default function SignificantFiguresScene3D({ towers }: SignificantFiguresScene3DProps) {
  const p = usePalette3D();
  const longest = Math.max(1, ...towers.map((t) => t.tower.digits.length + (t.tower.sign ? 1 : 0)));
  const rowWidth = longest * (BLOCK + GAP);
  const scale = Math.min(1, MAX_WIDTH / rowWidth);
  const z0 = ((towers.length - 1) * ROW_GAP) / 2;

  return (
    <group scale={[scale, scale, scale]}>
      <mesh position={[0, Y0 - 0.03, 0]}>
        <boxGeometry args={[rowWidth + 1.6, 0.05, towers.length * ROW_GAP + 0.4]} />
        <meshStandardMaterial color={p.grid} />
      </mesh>
      {towers.map((row, ri) => {
        const z = -z0 + ri * ROW_GAP;
        const n = row.tower.digits.length;
        const x0 = -((n - 1) * (BLOCK + GAP)) / 2;
        const xAt = (i: number) => x0 + i * (BLOCK + GAP);
        return (
          <group key={ri}>
            <Label position={[x0 - BLOCK - (row.tower.sign ? BLOCK : 0.2), Y0 + 0.3, z]} color={row.isResult ? p.positive : p.muted} size={13}>
              {row.label}
            </Label>
            {row.tower.sign ? (
              <Label position={[x0 - BLOCK + 0.1, Y0 + 0.3, z]} color={p.text} size={14}>
                −
              </Label>
            ) : null}
            {row.tower.digits.map((d, i) => {
              const h = height(d.digit);
              const x = xAt(i);
              const sig = d.role === "significant";
              const color = !d.kept ? p.danger : sig ? (row.isResult ? p.positive : p.primary) : p.muted;
              return (
                <group key={`${i}-${d.role}-${d.kept}`}>
                  {d.kept ? (
                    <mesh position={[x, Y0 + h / 2, z]}>
                      <boxGeometry args={[BLOCK, h, BLOCK]} />
                      <meshStandardMaterial color={color} roughness={0.4} transparent={!sig} opacity={sig ? 1 : 0.55} />
                    </mesh>
                  ) : (
                    <DroppedBlock x={x} z={z} h={h} color={color} />
                  )}
                  <Label position={[x, Y0 + h + 0.22, z]} color={d.kept ? p.text : p.danger} opacity={d.kept ? 1 : 0.6}>
                    {d.digit}
                  </Label>
                </group>
              );
            })}
            {row.tower.pointAfter !== null ? (
              <mesh position={[xAt(row.tower.pointAfter) + (BLOCK + GAP) / 2, Y0 + 0.08, z + BLOCK / 2]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color={p.text} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
