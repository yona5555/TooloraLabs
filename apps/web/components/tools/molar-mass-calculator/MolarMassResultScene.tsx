"use client";
import { useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { KitControls, KitTrack, SvgChem, useMeasuredSize, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { uniFormula } from "../chemical-equation-balancer/chemMath";
import { SvgMolecule } from "../chemical-equation-balancer/Molecules2D";
import { clampIndex, RAIL, RAIL_SEED, railPos } from "./mmMath";
import { spreadLabels, type MmSceneProps } from "./mmSceneLayout";
import { svgPx } from "@/components/tool-ui/svgPx";

const Scene3D = dynamic(() => import("./MolarMassResultScene3D"), { ssr: false, loading: () => null });

/** 2D twin of the 3D scene (no WebGL or no free slot): molecule on the left, mass column on the right. */
function Scene2D({ p }: { p: MmSceneProps }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 380, h: 320 });
  const colX = W * 0.6;
  const cw = Math.min(64, W * 0.13);
  const top = 46;
  const bottom = H - 16;
  const span = bottom - top;
  const upTo = (i: number) => p.parts.slice(0, i + 1).reduce((a, q) => a + q.pct, 0);
  const segs = p.parts.map((pt, i) => ({ pt, y: bottom - (span * upTo(i)) / 100, h: (span * pt.pct) / 100 }));
  // SVG y grows downwards: spread in "height above the bottom", then flip back.
  const ly = spreadLabels(
    segs.map((s) => bottom - (s.y + s.h / 2)),
    24,
    10,
    span - 10,
  ).map((v) => bottom - v);
  const molX = W * 0.27;
  const molSize = Math.min(W * 0.24, (H - 90) / 2.4);
  return (
    <div ref={box} dir="ltr" className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${p.formulaLabel} ${p.totalText}`}>
        {p.drawMolecule && <SvgMolecule formula={p.formula} x={molX} y={H / 2 - 20} size={molSize} />}
        <text x={molX} y={H / 2 + molSize + 6} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(18), fill: "var(--ph-ink)" }}>
          <SvgChem text={p.formulaLabel} />
        </text>
        <text x={molX} y={H / 2 + molSize + 28} fontWeight={600} textAnchor="middle" style={{ fontSize: svgPx(13), fill: "var(--ph-ink-muted)" }}>
          {p.atomsText}
        </text>
        {segs.map(({ pt, y, h }, i) => (
          <g key={pt.symbol}>
            <rect x={colX - cw / 2} y={y} width={cw} height={Math.max(0.5, h - 1)} rx={i === 0 || i === segs.length - 1 ? 6 : 0} style={{ fill: `var(${`--chem-el-${pt.symbol.toLowerCase()}`}, var(--chem-el-other))` }} />
            <text x={colX + cw / 2 + 10} y={ly[i] + 5} fontWeight={700} style={{ fontSize: svgPx(14), fill: "var(--ph-ink)" }}>
              {`${pt.symbol}  ${pt.pct.toFixed(1)} %`}
            </text>
          </g>
        ))}
        <text x={colX} y={top - 14} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(15), fill: "var(--ph-ink)" }}>
          {p.totalText}
        </text>
      </svg>
    </div>
  );
}

/**
 * §44: the scene at the top of the molar mass Result card — the formula's ball-and-stick molecule,
 * a column split by each element's share of the mass, and a horizontal rail through the calculator's
 * presets (ordered by molar mass). Dragging the rail writes the formula into the calculator; typing
 * a formula moves the handle to where its molar mass falls between the presets.
 */
export default function MolarMassResultScene({ p, mm, onSetFormula }: { p: MmSceneProps; mm: number; onSetFormula: (f: string) => void }) {
  const t = useTranslations("tools.molar-mass-calculator.visuals.hero");
  const pos = Math.round(railPos(mm, p.formula) * 100) / 100;
  const set = useCallback((v: number) => onSetFormula(RAIL[clampIndex(v, RAIL.length)].formula), [onSetFormula]);
  const s: Stepper = {
    value: pos,
    set,
    inc: () => set(Math.floor(pos + 1e-9) + 1),
    dec: () => set(Math.ceil(pos - 1e-9) - 1),
    reset: () => set(RAIL_SEED),
    flash: 0,
    atMin: pos <= 0,
    atMax: pos >= RAIL.length - 1,
    isSeed: p.formula === RAIL[RAIL_SEED].formula,
    min: 0,
    max: RAIL.length - 1,
    step: 1,
  };
  const valueText = `${uniFormula(p.formula)} · ${p.totalText}`;
  return (
    <div data-ph-scene-block className="flex min-h-[420px] flex-1 flex-col gap-2">
      <ViewportScene
        testId="mm-hero"
        className="min-h-[300px] flex-1"
        fallback={<Scene2D p={p} />}
        render3d={() => (
          <div className="absolute inset-0" dir="ltr" data-testid="mm-hero-3d">
            <Scene3D {...p} />
          </div>
        )}
      />
      <KitTrack
        s={s}
        label={t("handle")}
        valueText={valueText}
        testId="mm-hero-handle"
        ticks={[0, RAIL.length - 1].map((i) => ({ at: i, text: `${Math.round(RAIL[i].mm)} g/mol` }))}
      />
      <KitControls s={s} valueText={valueText} testId="mm-hero" />
    </div>
  );
}
