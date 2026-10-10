"use client";

import { Edges, Html, Line } from "@react-three/drei";
import { usePalette3D } from "@/components/tool-ui/three/theme3d";

/**
 * The circle as a thin rotating disk: circumference ring on the rim, labeled radius and
 * diameter on the top face, inscribed square on the face and circumscribed square on the floor.
 * Heavy (three + drei): imported ONLY through next/dynamic inside a <Scene3D>.
 * The scene is drawn at a fixed size; the labels carry the real values.
 */
export type CircleScene3DProps = {
  labels: { r: string; d: string; c: string; a: string };
};

const R = 2;
const H = 0.3;
const TOP = H / 2 + 0.01;
const S = R / Math.SQRT2;

export default function CircleScene3D({ labels }: CircleScene3DProps) {
  const p = usePalette3D();
  const bg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.92)";
  const pill = (text: string, color: string) => (
    <span
      style={{
        color,
        background: bg,
        border: `1px solid ${color}66`,
        borderRadius: 6,
        padding: "1px 6px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      {text}
    </span>
  );
  const at = (pos: [number, number, number], text: string, color: string) => (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      {pill(text, color)}
    </Html>
  );

  return (
    <group position={[0, -0.3, 0]}>
      <mesh>
        <cylinderGeometry args={[R, R, H, 96]} />
        <meshStandardMaterial color={p.primary} transparent opacity={0.8} />
        <Edges color={p.dark ? "#e4e4e7" : "#1e3a8a"} threshold={30} />
      </mesh>
      {/* Circumference ring on the rim. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TOP, 0]}>
        <torusGeometry args={[R, 0.05, 12, 128]} />
        <meshStandardMaterial color={p.warning} />
      </mesh>
      {/* Inscribed square on the top face. */}
      <Line
        points={[
          [S, TOP, S],
          [-S, TOP, S],
          [-S, TOP, -S],
          [S, TOP, -S],
          [S, TOP, S],
        ]}
        color={p.dark ? "#e0f2fe" : "#ffffff"}
        lineWidth={1.5}
      />
      {/* Circumscribed square on the floor. */}
      <Line
        points={[
          [R, -H / 2, R],
          [-R, -H / 2, R],
          [-R, -H / 2, -R],
          [R, -H / 2, -R],
          [R, -H / 2, R],
        ]}
        color={p.muted}
        lineWidth={1.2}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
      {/* Radius (center → rim along +x) and diameter (across along z). */}
      <Line points={[[0, TOP + 0.01, 0], [R, TOP + 0.01, 0]]} color={p.danger} lineWidth={3} />
      <Line points={[[0, TOP + 0.02, -R], [0, TOP + 0.02, R]]} color={p.positive} lineWidth={3} />
      <mesh position={[0, TOP, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={p.text} />
      </mesh>
      {at([R / 2, TOP + 0.3, 0], labels.r, p.danger)}
      {at([0, TOP + 0.3, R * 0.62], labels.d, p.positive)}
      {at([-R * 0.78, TOP + 0.35, -R * 0.78], labels.c, p.warning)}
      {at([0, TOP + 1.05, 0], labels.a, p.primary)}
      <gridHelper args={[8, 16, p.grid, p.grid]} position={[0, -H / 2 - 0.01, 0]} />
    </group>
  );
}
