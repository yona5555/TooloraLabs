"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges, Html, Line } from "@react-three/drei";
import type { Solid3DShape, SolidFaceKey } from "@tooloralabs/tools";
import { usePalette3D, type Palette3D } from "./theme3d";

/**
 * Live 3D solid for the volume and surface-area tools. Heavy (three + drei): import it ONLY
 * through next/dynamic inside a <Scene3D>, never statically from a page component.
 */
export type SolidScene3DProps = {
  shape: Solid3DShape;
  /** Real bounding extents (x across, y height, z depth); the scene rescales them to fit. */
  extents: { x: number; y: number; z: number };
  /** Preformatted dimension labels, e.g. { x: "l = 5", y: "h = 4" }. */
  labels: { x?: string; y?: string; z?: string; r?: string; slant?: string };
  /** When given, every face gets its own color and its label (surface-area mode). */
  faces?: Array<{ key: SolidFaceKey; label: string }>;
};

const FIT = 3.2;

type V3 = [number, number, number];

function Label({
  position,
  text,
  color,
  bg,
  normal,
}: {
  position: V3;
  text: string;
  color: string;
  bg: string;
  normal?: V3;
}) {
  const [shown, setShown] = useState(true);
  const pos = useMemo(() => new THREE.Vector3(...position), [position]);
  const n = useMemo(
    () => (normal ? new THREE.Vector3(...normal) : null),
    [normal],
  );
  const tmp = useRef(new THREE.Vector3());
  // Face labels hide while their face points away from the camera, so back faces never clutter the front.
  useFrame(({ camera }) => {
    if (!n) return;
    const facing = tmp.current.copy(camera.position).sub(pos).dot(n) > 0;
    if (facing !== shown) setShown(facing);
  });
  return (
    <Html
      position={position}
      center
      zIndexRange={[20, 0]}
      style={{
        pointerEvents: "none",
        opacity: shown ? 1 : 0,
        transition: "opacity 120ms",
      }}
    >
      <span
        style={{
          color,
          background: bg,
          border: `1px solid ${color}55`,
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
    </Html>
  );
}

function DimLine({
  from,
  to,
  text,
  p,
  offset = [0, 0, 0],
}: {
  from: V3;
  to: V3;
  text?: string;
  p: Palette3D;
  offset?: V3;
}) {
  const mid: V3 = [
    (from[0] + to[0]) / 2 + offset[0],
    (from[1] + to[1]) / 2 + offset[1],
    (from[2] + to[2]) / 2 + offset[2],
  ];
  return (
    <group>
      <Line points={[from, to]} color={p.warning} lineWidth={2} />
      <mesh position={from}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={p.warning} />
      </mesh>
      <mesh position={to}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={p.warning} />
      </mesh>
      {text ? (
        <Label
          position={mid}
          text={text}
          color={p.text}
          bg={p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.9)"}
        />
      ) : null}
    </group>
  );
}

function Tri({
  a,
  b,
  c,
  color,
  solid,
  edge,
}: {
  a: V3;
  b: V3;
  c: V3;
  color: string;
  solid: boolean;
  edge: string;
}) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...a),
      new THREE.Vector3(...b),
      new THREE.Vector3(...c),
    ]);
    g.computeVertexNormals();
    return g;
  }, [a, b, c]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent={!solid}
        opacity={solid ? 1 : 0.55}
      />
      <Edges color={edge} />
    </mesh>
  );
}

export default function SolidScene3D({
  shape,
  extents,
  labels,
  faces,
}: SolidScene3DProps) {
  const p = usePalette3D();
  const k = FIT / Math.max(extents.x, extents.y, extents.z, 1e-9);
  const X = extents.x * k;
  const Y = extents.y * k;
  const Z = extents.z * k;
  const R = X / 2;
  const colored = Boolean(faces);
  const edge = p.dark ? "#e4e4e7" : "#1e3a8a";
  const labelBg = p.dark ? "rgba(24,24,27,0.85)" : "rgba(255,255,255,0.9)";
  const faceColor = (key: SolidFaceKey) => {
    const i = faces ? faces.findIndex((f) => f.key === key) : -1;
    return i >= 0 ? p.faces[i % p.faces.length] : p.primary;
  };
  const faceLabel = (key: SolidFaceKey) =>
    faces?.find((f) => f.key === key)?.label;
  const mat = (color: string, attach?: string) => (
    <meshStandardMaterial
      key={attach ?? "m"}
      attach={attach}
      color={color}
      transparent={!colored}
      opacity={colored ? 1 : 0.55}
      side={THREE.DoubleSide}
    />
  );
  const gap = 0.28;
  const yb = -Y / 2;

  let body: ReactNode = null;
  const dims: ReactNode[] = [];
  const faceLabels: Array<{ key: SolidFaceKey; pos: V3; normal?: V3 }> = [];

  if (shape === "cube" || shape === "rectangular-prism") {
    // BoxGeometry material order: +x, -x, +y, -y, +z, -z.
    const order: SolidFaceKey[] = [
      "right",
      "left",
      "top",
      "bottom",
      "front",
      "back",
    ];
    body = (
      <mesh>
        <boxGeometry args={[X, Y, Z]} />
        {order.map((key, i) => mat(faceColor(key), `material-${i}`))}
        <Edges color={edge} />
      </mesh>
    );
    dims.push(
      <DimLine
        key="x"
        from={[-X / 2, yb, Z / 2 + gap]}
        to={[X / 2, yb, Z / 2 + gap]}
        text={labels.x}
        p={p}
        offset={[0, -0.18, 0]}
      />,
      <DimLine
        key="y"
        from={[X / 2 + gap, yb, Z / 2]}
        to={[X / 2 + gap, Y / 2, Z / 2]}
        text={labels.y}
        p={p}
        offset={[0.25, 0, 0]}
      />,
      <DimLine
        key="z"
        from={[X / 2 + gap, yb, Z / 2]}
        to={[X / 2 + gap, yb, -Z / 2]}
        text={labels.z}
        p={p}
        offset={[0.25, -0.15, 0]}
      />,
    );
    const o = 0.02;
    faceLabels.push(
      { key: "top", pos: [0, Y / 2 + o, 0], normal: [0, 1, 0] },
      { key: "bottom", pos: [0, -Y / 2 - o, 0], normal: [0, -1, 0] },
      { key: "front", pos: [0, 0, Z / 2 + o], normal: [0, 0, 1] },
      { key: "back", pos: [0, 0, -Z / 2 - o], normal: [0, 0, -1] },
      { key: "right", pos: [X / 2 + o, 0, 0], normal: [1, 0, 0] },
      { key: "left", pos: [-X / 2 - o, 0, 0], normal: [-1, 0, 0] },
    );
  } else if (shape === "sphere") {
    body = (
      <mesh>
        <sphereGeometry args={[R, 48, 32]} />
        {mat(faceColor("surface"))}
      </mesh>
    );
    dims.push(
      <DimLine
        key="r"
        from={[0, 0, 0]}
        to={[R, 0, 0]}
        text={labels.r}
        p={p}
        offset={[0, 0.2, 0]}
      />,
      <mesh key="eq" rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.012, 6, 96]} />
        <meshBasicMaterial color={edge} />
      </mesh>,
    );
    faceLabels.push({ key: "surface", pos: [-R * 0.35, R * 0.55, R * 0.76] });
  } else if (shape === "cylinder" || shape === "cone") {
    const isCone = shape === "cone";
    body = (
      <mesh>
        {isCone ? (
          <coneGeometry args={[R, Y, 64]} />
        ) : (
          <cylinderGeometry args={[R, R, Y, 64]} />
        )}
        {/* CylinderGeometry groups: 0 lateral, 1 top cap, 2 bottom cap (a cone has no top cap). */}
        {mat(faceColor("lateral"), "material-0")}
        {mat(faceColor("top"), "material-1")}
        {mat(faceColor(isCone ? "base" : "bottom"), "material-2")}
        <Edges color={edge} threshold={30} />
      </mesh>
    );
    dims.push(
      <DimLine
        key="r"
        from={[0, yb, 0]}
        to={[R, yb, 0]}
        text={labels.r}
        p={p}
        offset={[0, -0.2, 0.2]}
      />,
    );
    if (isCone) {
      dims.push(
        <DimLine
          key="h"
          from={[0, yb, 0]}
          to={[0, Y / 2, 0]}
          text={labels.y}
          p={p}
          offset={[-0.35, 0, 0]}
        />,
      );
      if (labels.slant)
        dims.push(
          <DimLine
            key="s"
            from={[0, Y / 2, R * 0.02]}
            to={[0, yb, R]}
            text={labels.slant}
            p={p}
            offset={[0.1, 0.1, 0.3]}
          />,
        );
      faceLabels.push(
        { key: "base", pos: [0, yb - 0.02, 0], normal: [0, -1, 0] },
        { key: "lateral", pos: [-R * 0.35, 0, R * 0.45] },
      );
    } else {
      dims.push(
        <DimLine
          key="h"
          from={[R + gap, yb, 0]}
          to={[R + gap, Y / 2, 0]}
          text={labels.y}
          p={p}
          offset={[0.3, 0, 0]}
        />,
      );
      faceLabels.push(
        { key: "top", pos: [0, Y / 2 + 0.02, 0], normal: [0, 1, 0] },
        { key: "bottom", pos: [0, yb - 0.02, 0], normal: [0, -1, 0] },
        { key: "lateral", pos: [-R * 0.5, 0, R * 0.87] },
      );
    }
  } else if (shape === "square-pyramid") {
    const apex: V3 = [0, Y / 2, 0];
    const fl: V3 = [-X / 2, yb, Z / 2];
    const fr: V3 = [X / 2, yb, Z / 2];
    const br: V3 = [X / 2, yb, -Z / 2];
    const bl: V3 = [-X / 2, yb, -Z / 2];
    const tris: Array<{ key: SolidFaceKey; pts: [V3, V3, V3] }> = [
      { key: "front", pts: [fl, fr, apex] },
      { key: "right", pts: [fr, br, apex] },
      { key: "back", pts: [br, bl, apex] },
      { key: "left", pts: [bl, fl, apex] },
    ];
    body = (
      <group>
        <mesh position={[0, yb, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[X, Z]} />
          {mat(faceColor("base"))}
          <Edges color={edge} />
        </mesh>
        {tris.map((t) => (
          <Tri
            key={t.key}
            a={t.pts[0]}
            b={t.pts[1]}
            c={t.pts[2]}
            color={faceColor(t.key)}
            solid={colored}
            edge={edge}
          />
        ))}
      </group>
    );
    const midFront: V3 = [0, yb, Z / 2];
    dims.push(
      <DimLine
        key="x"
        from={[-X / 2, yb, Z / 2 + gap]}
        to={[X / 2, yb, Z / 2 + gap]}
        text={labels.x}
        p={p}
        offset={[0, -0.18, 0]}
      />,
      <DimLine
        key="h"
        from={[0, yb, 0]}
        to={apex}
        text={labels.y}
        p={p}
        offset={[-0.35, 0, 0]}
      />,
    );
    if (labels.slant)
      dims.push(
        <DimLine
          key="s"
          from={midFront}
          to={apex}
          text={labels.slant}
          p={p}
          offset={[0.35, 0, 0.15]}
        />,
      );
    const ny = Z / 2;
    const nz = Y;
    const len = Math.hypot(ny, nz) || 1;
    const cy = yb + Y / 3;
    faceLabels.push(
      { key: "base", pos: [0, yb - 0.02, 0], normal: [0, -1, 0] },
      {
        key: "front",
        pos: [-X * 0.12, cy, Z / 6 + 0.02],
        normal: [0, ny / len, nz / len],
      },
      {
        key: "back",
        pos: [0, cy, -Z / 6 - 0.02],
        normal: [0, ny / len, -nz / len],
      },
      {
        key: "right",
        pos: [X / 6 + 0.02, cy, 0],
        normal: [nz / len, ny / len, 0],
      },
      {
        key: "left",
        pos: [-X / 6 - 0.02, cy, 0],
        normal: [-nz / len, ny / len, 0],
      },
    );
  }

  return (
    <group>
      {body}
      {dims}
      {colored
        ? faceLabels.map((f) => {
            const text = faceLabel(f.key);
            return text ? (
              <Label
                key={f.key}
                position={f.pos}
                normal={f.normal}
                text={text}
                color={faceColor(f.key)}
                bg={labelBg}
              />
            ) : null;
          })
        : null}
      <gridHelper args={[8, 16, p.grid, p.grid]} position={[0, yb - 0.01, 0]} />
    </group>
  );
}
