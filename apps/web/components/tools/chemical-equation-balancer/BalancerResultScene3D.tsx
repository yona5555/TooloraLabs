"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { usePhColors, type PhColors } from "../ph-calculator/phColors";
import { EL_TOKENS, labelFormula, moleculeLayout, REACTIONS } from "./chemMath";
import { Molecules, type Placed } from "./Molecules3D";

export type BalProjection = { knob: [number, number]; left: [number, number]; right: [number, number] };
export type SceneTerm = { formula: string; coefficient: number; side: "reactant" | "product" };

const TOKENS = [...EL_TOKENS, "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted", "--ph-focus", "--chem-reactant", "--chem-product"];
const RAIL_X = 2.9;
const MAX_PER_TERM = 12;
export const railX = (i: number) => -RAIL_X + (i / (REACTIONS.length - 1)) * 2 * RAIL_X;

/** Extent of one molecule at scale 1 (for packing). */
function extent(formula: string) {
  const lay = moleculeLayout(formula);
  return 2 * Math.max(0.2, ...lay.map((a) => Math.hypot(a.p[0], a.p[1], a.p[2]))) + 0.42;
}

/** Packs each term's molecules (coefficient copies) on its side's pan, rows growing upward. */
export function placeTerms(terms: SceneTerm[], side: "reactant" | "product", x0: number, x1: number, base: number, maxH: number) {
  const list = terms.filter((t) => t.side === side);
  const out: Placed[] = [];
  const labels: { text: string; x: number; y: number }[] = [];
  // Each term gets width in proportion to its molecule size × √count, so one big molecule is not squeezed.
  const weights = list.map((t) => extent(t.formula) * Math.sqrt(Math.min(t.coefficient, MAX_PER_TERM)));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let cursor = x0;
  list.forEach((t, k) => {
    const w = ((x1 - x0) * weights[k]) / total;
    const n = Math.min(t.coefficient, MAX_PER_TERM);
    const e = extent(t.formula);
    // Columns chosen from the zone's shape, so a tall card stacks the molecules higher instead of leaving a band.
    const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt((n * w) / maxH))));
    const rows = Math.ceil(n / cols);
    const s = Math.min(1.5, (w * 0.92) / (cols * e), maxH / (rows * e));
    const cx = cursor + w / 2;
    cursor += w;
    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const inRow = row === rows - 1 ? n - row * cols : cols;
      out.push({ formula: t.formula, scale: s, at: [cx + (col - (inRow - 1) / 2) * e * s, base + (row + 0.5) * e * s, (row % 2) * 0.1] });
    }
    labels.push({ text: `${t.coefficient > 1 ? t.coefficient : ""}${labelFormula(t.formula)}`, x: cx, y: base + rows * e * s + 0.28 });
  });
  return { out, labels };
}

type Props = { terms: SceneTerm[]; index: number; dragging: boolean; onProject: (p: BalProjection) => void };

function Scene({ terms, index, dragging, onProject, c }: Props & { c: PhColors }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const controls = get().controls as unknown as { enabled: boolean } | null;
    if (controls) controls.enabled = !dragging;
  }, [get, dragging]);

  // Tall Result card (stretched to the input column): the molecule zone grows with the canvas, no empty band.
  const size = useThree((s) => s.size);
  const k = Math.min(3, Math.max(1, (1.6 * size.height) / Math.max(1, size.width)));
  const span = 4.6 * k;
  const RAIL_Y = -span / 2 + 0.35;
  const PAN_Y = RAIL_Y + 1.4;
  const zone = span / 2 - PAN_Y - 0.55;
  const L = useMemo(() => placeTerms(terms, "reactant", -3.5, -0.45, PAN_Y + 0.08, zone), [terms, PAN_Y, zone]);
  const R = useMemo(() => placeTerms(terms, "product", 0.45, 3.5, PAN_Y + 0.08, zone), [terms, PAN_Y, zone]);
  // Centre the whole block (labels to rail numbers) vertically in the canvas.
  const top = Math.max(PAN_Y + 1, ...[...L.labels, ...R.labels].map((l) => l.y + 0.3));
  const shift = -(top + RAIL_Y - 0.8) / 2;
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), m: new THREE.Vector3() }), []);
  const last = useRef("");
  const knobX = railX(Math.max(0, index));
  useFrame(({ camera, size }) => {
    const px = (p: THREE.Vector3): [number, number] => {
      p.project(camera);
      return [((p.x + 1) / 2) * size.width, ((1 - p.y) / 2) * size.height];
    };
    const ry = RAIL_Y + shift;
    const proj: BalProjection = { knob: px(v.m.set(knobX, ry, 0)), left: px(v.a.set(-RAIL_X, ry, 0)), right: px(v.b.set(RAIL_X, ry, 0)) };
    const key = [proj.knob, proj.left, proj.right].flat().map((n) => n.toFixed(1)).join(",");
    if (key !== last.current) {
      last.current = key;
      onProject(proj);
    }
  });

  const pan = (x: number, color: string) => (
    <group position={[x, PAN_Y, 0]}>
      <mesh>
        <cylinderGeometry args={[1.45, 1.3, 0.1, 48]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
    </group>
  );
  return (
    <group position={[0, shift, 0]}>
      <Molecules items={[...L.out, ...R.out]} c={c} />
      {[...L.labels, ...R.labels].map((l, i) => (
        <Label3D key={i} position={[l.x, l.y, 0]} color={c["--ph-ink"]} fontSize={11} weight={700} text={l.text} />
      ))}
      {/* Equal-arm balance: level because both pans carry the same atoms. */}
      {pan(-1.95, c["--chem-reactant"])}
      {pan(1.95, c["--chem-product"])}
      <mesh position={[0, PAN_Y - 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 4.2, 16]} />
        <meshStandardMaterial color={c["--ph-ink-muted"]} />
      </mesh>
      <mesh position={[0, PAN_Y - 0.55, 0]}>
        <coneGeometry args={[0.3, 0.75, 32]} />
        <meshStandardMaterial color={c["--ph-ink-muted"]} />
      </mesh>
      <Label3D position={[0, PAN_Y + 0.75, 0]} color={c["--ph-ink"]} fontSize={14} weight={800} text="→" />
      {/* Reaction rail: one stop per preset, the knob is the draggable handle. */}
      <mesh position={[0, RAIL_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, RAIL_X * 2, 16]} />
        <meshStandardMaterial color={c["--ph-glass"]} />
      </mesh>
      {REACTIONS.map((r, i) => (
        <group key={r.key}>
          <mesh position={[railX(i), RAIL_Y, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={i === index ? c["--ph-focus"] : c["--ph-ink-muted"]} />
          </mesh>
          <Label3D position={[railX(i), RAIL_Y - 0.6, 0]} color={c["--ph-ink-muted"]} fontSize={10} text={String(i + 1)} />
        </group>
      ))}
      {index >= 0 && (
        <group position={[knobX, RAIL_Y, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 24, 16]} />
            <meshStandardMaterial color={c["--ph-knob"]} roughness={0.3} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.24, 0.045, 10, 32]} />
            <meshStandardMaterial color={c["--ph-ink"]} />
          </mesh>
        </group>
      )}
      <Invalidate deps={[terms, index, dragging, c, k]} />
    </group>
  );
}

/** §44: the 3D scene at the top of the balancer's Result card (molecules on a level two-pan balance). */
export default function BalancerResultScene3D(props: Props) {
  const c = usePhColors(TOKENS);
  if (!c) return null;
  return (
    <PhCanvas3D camera={[0, 0.6, 9.2]} testId="bal-hero-canvas" minDistance={6} maxDistance={13} azimuth={0.7} fitAspect={1.45}>
      <Scene {...props} c={c} />
    </PhCanvas3D>
  );
}
