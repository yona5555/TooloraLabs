"use client";
import * as THREE from "three";
import PhCanvas3D, { ChemLabel3D as Label3D, Invalidate } from "../ph-calculator/PhCanvas3D";
import { usePhColors, type PhColors } from "../ph-calculator/phColors";
import { atomsOf, EL_TOKENS, elToken, uniFormula } from "../chemical-equation-balancer/chemMath";
import { Molecules, type Placed } from "../chemical-equation-balancer/Molecules3D";
import { g3 } from "../molarity-calculator/molMath";
import { BEAKER_ML, GROUPS, partsOf } from "./mmMath";

/**
 * The three 3D molar mass indicator scenes (water in a beaker, a copper sulfate hydrate, atom towers
 * of a formula with a group). Loaded only through next/dynamic (ssr:false), and only while the card
 * holds a WebGL slot.
 */
const TOKENS = [...EL_TOKENS, "--ph-glass", "--ph-ink", "--ph-ink-muted", "--ph-focus", "--ph-line", "--ph-surface", "--chem-solvent", "--chem-cold"];
const useColors = (): PhColors | null => usePhColors(TOKENS);

// ── 1. Water in a beaker: liquid height ∝ volume ──────────────────────────────────────
export function BeakerScene3D({ volume, label, hover }: { volume: number; label: string; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const H = 3.2;
  const R = 1.25;
  const y0 = -1.7;
  const h = Math.max(0.02, (H * volume) / BEAKER_ML);
  const lit = hover === "v" || hover === "m";
  return (
    <PhCanvas3D camera={[0, 1.3, 7.6]} testId="mm-c1-canvas" minDistance={5} maxDistance={12} azimuth={0.8} fitAspect={1.2}>
      <mesh position={[0, y0 + H / 2, 0]}>
        <cylinderGeometry args={[R, R, H, 48, 1, true]} />
        <meshStandardMaterial color={c["--ph-glass"]} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, y0 - 0.04, 0]}>
        <cylinderGeometry args={[R, R, 0.08, 48]} />
        <meshStandardMaterial color={c["--ph-glass"]} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, y0 + h / 2, 0]}>
        <cylinderGeometry args={[R - 0.05, R - 0.05, h, 48]} />
        <meshStandardMaterial color={c["--chem-cold"]} transparent opacity={0.75} emissive={c["--chem-cold"]} emissiveIntensity={lit ? 0.45 : 0.15} roughness={0.15} />
      </mesh>
      {[50, 100, 150, 200].map((ml) => (
        <group key={ml}>
          <mesh position={[0, y0 + (H * ml) / BEAKER_ML, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R + 0.01, 0.012, 6, 64]} />
            <meshStandardMaterial color={c["--ph-ink-muted"]} />
          </mesh>
          <Label3D position={[R + 0.15, y0 + (H * ml) / BEAKER_ML, 0]} align="left" color={c["--ph-ink-muted"]} fontSize={11} text={`${ml} mL`} />
        </group>
      ))}
      <Label3D position={[0, y0 + h, 0]} offset={[0, 16]} color={c["--ph-ink"]} bg={c["--ph-surface"]} border={c["--ph-line"]} fontSize={13} weight={800} text={label} avoid={false} />
      <Invalidate deps={[volume, label, hover, c]} />
    </PhCanvas3D>
  );
}

// ── 3. CuSO₄·nH₂O: the formula unit with its bound waters ─────────────────────────────
export function HydrateScene3D({ n, label, hover }: { n: number; label: string; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const items: Placed[] = [{ formula: "CuSO4", at: [0, 0.2, 0], scale: 1.7, lit: hover === "salt" }];
  for (let i = 0; i < n; i++) {
    const a = (i / Math.max(1, n)) * Math.PI * 2 + 0.4;
    items.push({ formula: "H2O", at: [Math.round(Math.cos(a) * 2.1 * 1e4) / 1e4, 0.2 + Math.round(Math.sin(a) * 1.25 * 1e4) / 1e4, Math.round(Math.sin(a) * 0.6 * 1e4) / 1e4], scale: 1.3 });
  }
  return (
    <PhCanvas3D camera={[0, 0.8, 8]} testId="mm-c3-canvas" minDistance={5} maxDistance={12} azimuth={0.9} fitAspect={1.4}>
      <Molecules items={items} c={c} highlight={hover === "water" || hover === "pct" ? "H" : hover === "salt" ? "Cu" : undefined} />
      <Label3D position={[0, -1.75, 0]} color={c["--ph-ink"]} fontSize={14} weight={800} text={label} avoid={false} />
      <Invalidate deps={[n, label, hover, c]} />
    </PhCanvas3D>
  );
}

// ── 7. Atom towers: one sphere per atom, group atoms ringed ───────────────────────────
export function GroupsScene3D({ index, hover }: { index: number; hover: string | null }) {
  const c = useColors();
  if (!c) return null;
  const g = GROUPS[index];
  const parts = partsOf(g.formula)?.parts ?? [];
  const inGroup = new Set(Object.keys(atomsOf(g.group) ?? {}));
  const n = parts.length;
  // Towers sized to the tallest one (12 O in Al₂(SO₄)₃ … 2 in Ca(OH)₂), centred, so the scene stays full.
  const maxCount = Math.max(1, ...parts.map((p) => p.count));
  const STEP = Math.min(0.75, 3.6 / maxCount);
  const R = STEP * 0.47;
  const y0 = -(maxCount * STEP) / 2 - 0.2;
  return (
    <PhCanvas3D camera={[0, 1.2, 8.2]} testId="mm-c7-canvas" minDistance={5} maxDistance={13} azimuth={0.8} fitAspect={1.4}>
      {parts.map((pt, i) => {
        const x = (i - (n - 1) / 2) * 1.5;
        const grp = inGroup.has(pt.symbol);
        const lit = hover === pt.symbol || (hover === "mult" && grp);
        return (
          <group key={pt.symbol} position={[x, 0, 0]}>
            {Array.from({ length: pt.count }, (_, k) => (
              <mesh key={k} position={[0, y0 + R + k * STEP, 0]}>
                <sphereGeometry args={[R, 20, 14]} />
                <meshStandardMaterial color={c[elToken(pt.symbol)]} emissive={c[elToken(pt.symbol)]} emissiveIntensity={lit ? 0.55 : 0.15} roughness={0.35} />
              </mesh>
            ))}
            {grp && (
              <mesh position={[0, y0 + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[R + 0.22, 0.04, 10, 40]} />
                <meshStandardMaterial color={c["--ph-focus"]} emissive={c["--ph-focus"]} emissiveIntensity={0.5} />
              </mesh>
            )}
            <Label3D position={[0, y0 + pt.count * STEP, 0]} offset={[0, 14]} color={c["--ph-ink"]} fontSize={14} weight={800} text={String(pt.count)} avoid={false} />
            <Label3D position={[0, y0, 0]} offset={[0, -18]} color={c["--ph-ink"]} fontSize={13} weight={700} text={grp ? `${pt.symbol} ×${g.mult}` : pt.symbol} avoid={false} />
          </group>
        );
      })}
      <Label3D position={[0, y0, 0]} offset={[0, -44]} color={c["--ph-ink-muted"]} fontSize={13} weight={700} text={`${uniFormula(g.formula)} · ${g3(partsOf(g.formula)?.total ?? 0)} g/mol`} avoid={false} />
      <Invalidate deps={[index, hover, c]} />
    </PhCanvas3D>
  );
}
