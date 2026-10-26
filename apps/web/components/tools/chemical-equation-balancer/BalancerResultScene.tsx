"use client";
import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { GlassHandle } from "@/components/tool-ui/glass/GlassPrimitives";
import { KitControls, SvgChem, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { useAnchoredDrag } from "@/components/tool-ui/indicator-kit/useAnchoredDrag";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { snap } from "@/components/tool-ui/indicator-kit/format";
import { REACTIONS, uniFormula } from "./chemMath";
import { SvgMolecule } from "./Molecules2D";
import type { BalProjection, SceneTerm } from "./BalancerResultScene3D";
import { svgPx } from "@/components/tool-ui/svgPx";

const Scene3D = dynamic(() => import("./BalancerResultScene3D"), { ssr: false, loading: () => null });
const LAST = REACTIONS.length - 1;

/** 2D twin of the 3D balance (no WebGL or no free slot): same molecules per side, same reaction rail. */
function Scene2D({ s, terms, valueText, label }: { s: Stepper; terms: SceneTerm[]; valueText: string; label: string }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 380, h: 320 });
  const ref = useRef<SVGSVGElement>(null);
  const RX0 = 34;
  const RX1 = W - 34;
  const railY = H - 30;
  const xi = (i: number) => RX0 + (i / LAST) * (RX1 - RX0);
  const drag = useSvgDrag(ref, W, H, (px) => s.set(((px - RX0) / (RX1 - RX0)) * LAST));
  const panY = railY - 58;
  const side = (sd: "reactant" | "product", x0: number, x1: number) => {
    const list = terms.filter((t) => t.side === sd);
    const w = (x1 - x0) / Math.max(1, list.length);
    return list.map((t, k) => {
      const n = Math.min(t.coefficient, 12);
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      const cell = Math.min(w / cols, (panY - 50) / rows, 46);
      const cx = x0 + w * (k + 0.5);
      return (
        <g key={`${sd}${k}`}>
          {Array.from({ length: n }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const inRow = row === rows - 1 ? n - row * cols : cols;
            return <SvgMolecule key={i} formula={t.formula} x={cx + (col - (inRow - 1) / 2) * cell} y={panY - 8 - (row + 0.5) * cell} size={cell * 0.62} />;
          })}
          <text x={cx} y={panY - rows * cell - 18} fontWeight={700} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink)" }}>
            <SvgChem text={`${t.coefficient > 1 ? t.coefficient : ""}${uniFormula(t.formula)}`} />
          </text>
        </g>
      );
    });
  };
  return (
    <div ref={box} dir="ltr" className="relative w-full flex-1">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {side("reactant", 10, W / 2 - 18)}
        {side("product", W / 2 + 18, W - 10)}
        <rect x={14} y={panY - 4} width={W / 2 - 40} height={8} rx={4} style={{ fill: "var(--chem-reactant)" }} />
        <rect x={W / 2 + 26} y={panY - 4} width={W / 2 - 40} height={8} rx={4} style={{ fill: "var(--chem-product)" }} />
        <path d={`M ${W / 2 - 12} ${panY + 22} L ${W / 2} ${panY} L ${W / 2 + 12} ${panY + 22} Z`} style={{ fill: "var(--ph-ink-muted)" }} />
        <text x={W / 2} y={panY - 30} fontWeight={800} textAnchor="middle" style={{ fontSize: svgPx(18), fill: "var(--ph-ink)" }}>
          →
        </text>
        <line x1={RX0} y1={railY} x2={RX1} y2={railY} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} strokeLinecap="round" />
        {REACTIONS.map((r, i) => (
          <g key={r.key}>
            <circle cx={xi(i)} cy={railY} r={4} style={{ fill: i === s.value ? "var(--ph-focus)" : "var(--ph-ink-muted)" }} />
            <text x={xi(i)} y={railY + 22} textAnchor="middle" style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <SvgHandle x={xi(s.value)} y={railY} viewW={W} viewH={H} direction="horizontal" label={label} valueText={valueText} s={s} drag={drag} testId="bal-hero-handle" />
    </div>
  );
}

/**
 * §44: the 3D scene at the top of the balancer's Result card. The knob on the reaction rail picks
 * one of the six reactions and writes it into the equation field (and the field moves the knob).
 */
export default function BalancerResultScene({ terms, index, onSetReaction }: { terms: SceneTerm[]; index: number; onSetReaction: (i: number) => void }) {
  const t = useTranslations("tools.chemical-equation-balancer.visuals.hero");
  const tScen = useTranslations("tools.chemical-equation-balancer.form.scenarios");
  const value = index < 0 ? 0 : index;
  const set = useCallback((v: number) => onSetReaction(snap(v, 1, 0, LAST)), [onSetReaction]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + 1),
    dec: () => set(value - 1),
    reset: () => set(0),
    flash: 0,
    atMin: index >= 0 && value <= 0,
    atMax: value >= LAST,
    isSeed: index === 0,
    min: 0,
    max: LAST,
    step: 1,
  };
  const key = REACTIONS[value].key;
  const name = index < 0 ? t("custom") : key === "ironRusting" ? t("ironRusting") : tScen(key);
  const valueText = index < 0 ? name : `${value + 1} / ${REACTIONS.length} · ${name}`;
  const [proj, setProj] = useState<BalProjection | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag3d = useAnchoredDrag(value, () => (proj ? [proj.right[0] - proj.left[0], proj.right[1] - proj.left[1]] : null), set, setDragging, LAST);
  const label = t("handle");

  return (
    <div data-ph-scene-block className="flex min-h-[340px] flex-1 flex-col gap-3 lg:min-h-[320px]">
      <ViewportScene
        testId="bal-hero"
        className="min-h-[280px] flex-1"
        fallback={<Scene2D s={s} terms={terms} valueText={valueText} label={label} />}
        render3d={() => (
          <div className="absolute inset-0" dir="ltr" data-testid="bal-hero-3d">
            <Scene3D terms={terms} index={index} dragging={dragging} onProject={setProj} />
            {proj && (
              <div data-testid="bal-hero-handle" className="absolute inset-0" style={{ pointerEvents: "none" }}>
                <div className="absolute h-11 w-11 touch-none" style={{ left: proj.knob[0], top: proj.knob[1], transform: "translate(-50%, -50%)", pointerEvents: "auto" }} {...drag3d}>
                  <GlassHandle direction="horizontal" valueText={valueText} ariaLabel={label} onStep={(d) => (d > 0 ? s.inc() : s.dec())} valueNow={value} valueMin={0} valueMax={LAST} style={{ left: 0, top: 0 }} />
                </div>
              </div>
            )}
          </div>
        )}
      />
      <KitControls s={s} valueText={valueText} testId="bal-hero" />
    </div>
  );
}
