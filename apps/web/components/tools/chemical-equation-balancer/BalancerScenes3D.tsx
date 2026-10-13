"use client";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { usePhColors, type PhColors } from "../ph-calculator/phColors";
import { g3 } from "../molarity-calculator/molMath";
import { COLUMN_TERMS, EL_TOKENS, labelFormula } from "./chemMath";
import { gridOf, Molecules } from "./Molecules3D";

/**
 * The three 3D balancer indicator scenes (coefficient copies, Lavoisier's balance, coefficient
 * columns). Loaded only through next/dynamic (ssr:false), and only while the card holds a WebGL slot.
 */
const TOKENS = [...EL_TOKENS, "--ph-glass", "--ph-knob", "--ph-ink", "--ph-ink-muted", "--ph-focus", "--chem-reactant", "--chem-product", "--chem-gas", "--chem-solvent"];
const useColors = (): PhColors | null => usePhColors(TOKENS);

// ── 1. What a coefficient counts: n separate water molecules ──────────────────────────
export function CopiesScene3D({ n, hover }: { n: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const cols = Math.min(4, n);
  const rows = Math.ceil(n / cols);
  const items = gridOf("H2O", n, [0, 0.55 * (rows - 1) + 0.1, 0], (cols - 1) * 1.15, 1.15, 1.25);
  const el = hover === "h" ? "H" : hover === "o" ? "O" : undefined;
  return (
    <PhCanvas3D camera={[0, 0.8, 6.4]} testId="bal-c1-canvas" minDistance={4.5} maxDistance={11} fitAspect={1.5}>
      <Molecules items={items} c={c} highlight={el} />
      <Label3D position={[0, -0.75 - 0.58 * (rows - 1), 0]} color={c["--ph-ink"]} fontSize={12} weight={700} text={`${n} H_{2}O`} />
      <Invalidate deps={[n, hover, c]} />
    </PhCanvas3D>
  );
}

// ── 5. Lavoisier's balance: reactant mass = product mass ──────────────────────────────
/** Weight height per gram (the heavier side never leaves the canvas). */
const hOf = (g: number, max: number) => (2.2 * g) / max;

export function ScaleScene3D({ h2, o2, water, max, hover }: { h2: number; o2: number; water: number; max: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const Y = -1.3;
  const weight = (x: number, y0: number, g: number, color: string, lit: boolean) => (
    <mesh position={[x, y0 + hOf(g, max) / 2, 0]}>
      <cylinderGeometry args={[0.6, 0.6, Math.max(0.02, hOf(g, max)), 40]} />
      <meshStandardMaterial color={color} roughness={0.35} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.3 : 0} />
    </mesh>
  );
  const pan = (x: number) => (
    <mesh position={[x, Y - 0.05, 0]}>
      <cylinderGeometry args={[1.0, 0.9, 0.1, 40]} />
      <meshStandardMaterial color={c["--ph-ink-muted"]} roughness={0.5} />
    </mesh>
  );
  return (
    <PhCanvas3D camera={[0, 0.9, 7]} testId="bal-c5-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.5}>
      {pan(-1.7)}
      {pan(1.7)}
      {weight(-1.7, Y, h2, c["--chem-el-h"], hover === "h2")}
      {weight(-1.7, Y + hOf(h2, max), o2, c["--chem-el-o"], hover === "o2")}
      {weight(1.7, Y, water, c["--chem-product"], hover === "water")}
      <mesh position={[0, Y - 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 3.8, 16]} />
        <meshStandardMaterial color={c["--ph-ink-muted"]} />
      </mesh>
      <mesh position={[0, Y - 0.6, 0]}>
        <coneGeometry args={[0.32, 0.8, 32]} />
        <meshStandardMaterial color={c["--ph-ink-muted"]} />
      </mesh>
      <Label3D position={[-1.7, Y + hOf(h2 + o2, max) + 0.3, 0]} color={c["--ph-ink"]} fontSize={11} weight={700} text={`${g3(h2 + o2)} g`} />
      <Label3D position={[1.7, Y + hOf(water, max) + 0.3, 0]} color={c["--ph-ink"]} fontSize={11} weight={700} text={`${g3(water)} g`} />
      <Label3D position={[-1.7, Y - 0.45, 0.9]} color={c["--ph-ink-muted"]} fontSize={10} text="H_{2} + O_{2}" />
      <Label3D position={[1.7, Y - 0.45, 0.9]} color={c["--ph-ink-muted"]} fontSize={10} text="H_{2}O" />
      <Invalidate deps={[h2, o2, water, max, hover, c]} />
    </PhCanvas3D>
  );
}

// ── 8. The smallest whole numbers: coefficient columns × k ────────────────────────────

export function ColumnsScene3D({ k, hover }: { k: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const unit = 2.6 / (2 * k); // the tallest column keeps one height; the solid k = 1 core shrinks as k grows
  const xs = [-1.9, -0.6, 1.6];
  return (
    <PhCanvas3D camera={[0, 1.2, 7]} testId="bal-c8-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.4}>
      <mesh position={[0, -1.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 64]} />
        <meshStandardMaterial color={c["--chem-solvent"]} transparent opacity={0.45} />
      </mesh>
      {COLUMN_TERMS.map((t, i) => {
        const coef = t.base * k;
        const h = coef * unit;
        const base = t.base * unit;
        const lit = hover === t.formula || hover === "k";
        return (
          <group key={t.formula} position={[xs[i], -1.5, 0]}>
            {/* The smallest set (k = 1) is the solid core; the multiplied part is translucent. */}
            <mesh position={[0, base / 2, 0]}>
              <cylinderGeometry args={[0.42, 0.42, base, 40]} />
              <meshStandardMaterial color={t.side === "reactant" ? c["--chem-reactant"] : c["--chem-product"]} roughness={0.35} emissive={lit ? c["--ph-focus"] : "#000000"} emissiveIntensity={lit ? 0.25 : 0} />
            </mesh>
            {k > 1 && (
              <mesh position={[0, base + (h - base) / 2, 0]}>
                <cylinderGeometry args={[0.42, 0.42, h - base, 40]} />
                <meshStandardMaterial color={t.side === "reactant" ? c["--chem-reactant"] : c["--chem-product"]} transparent opacity={0.4} depthWrite={false} />
              </mesh>
            )}
            <Label3D position={[0, h + 0.3, 0]} color={c["--ph-ink"]} fontSize={12} weight={800} text={`${coef}`} />
            <Label3D position={[0, -0.3, 0.6]} color={c["--ph-ink-muted"]} fontSize={10} text={labelFormula(t.formula)} />
          </group>
        );
      })}
      <Label3D position={[0.5, -0.9, 0]} color={c["--ph-ink"]} fontSize={14} weight={800} text="→" />
      <Invalidate deps={[k, hover, c]} />
    </PhCanvas3D>
  );
}
