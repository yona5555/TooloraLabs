"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { GlassHandle } from "@/components/tool-ui/glass/GlassPrimitives";
import { KitControls, SvgHandle, useMeasuredSize, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { useAnchoredDrag } from "@/components/tool-ui/indicator-kit/useAnchoredDrag";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { ballPoints, snap } from "@/components/tool-ui/indicator-kit/format";
import { g3, liquidCss, V_MAX, V_MIN, V_STEP } from "./molMath";
import type { MolProjection } from "./MolarityResultScene3D";
import { svgPx } from "@/components/tool-ui/svgPx";

const Scene3D = dynamic(() => import("./MolarityResultScene3D"), { ssr: false, loading: () => null });
const PTS = ballPoints(64, 17);

type SceneProps = { mode: "concentration" | "dilution"; volume: number; molarity: number; particles: number; stockVolume: number; stockMolarity: number };

/** 2D twin of the 3D beakers (no WebGL or no free slot): same liquids, particles and 0–5 L scale. */
function Scene2D({ s, valueText, label, p }: { s: Stepper; valueText: string; label: string; p: SceneProps }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 380, h: 320 });
  const BAR_X = W - 56;
  const TOP = 22;
  const BOTTOM = H - 22;
  const yFor = (v: number) => BOTTOM - (Math.min(v, V_MAX) / V_MAX) * (BOTTOM - TOP);
  const drag = useAnchoredDrag(s.value, () => [0, -(BOTTOM - TOP)], s.set, undefined, V_MAX);
  const dil = p.mode === "dilution";
  const beaker = (L: number, R: number, vol: number, m: number, key: string) => {
    const level = yFor(vol);
    const cx = (L + R) / 2;
    return (
      <g key={key}>
        <path d={`M ${L + 3} ${level} L ${L + 3} ${BOTTOM - 14} Q ${L + 3} ${BOTTOM - 3} ${L + 14} ${BOTTOM - 3} L ${R - 14} ${BOTTOM - 3} Q ${R - 3} ${BOTTOM - 3} ${R - 3} ${BOTTOM - 14} L ${R - 3} ${level} Z`} style={{ fill: liquidCss(m), opacity: 0.8 }} />
        <path d={`M ${L} ${TOP} L ${L} ${BOTTOM - 14} Q ${L} ${BOTTOM} ${L + 14} ${BOTTOM} L ${R - 14} ${BOTTOM} Q ${R} ${BOTTOM} ${R} ${BOTTOM - 14} L ${R} ${TOP}`} fill="none" style={{ stroke: "var(--ph-line)" }} strokeWidth={2.5} strokeLinecap="round" />
        {PTS.slice(0, p.particles).map((q, i) => (
          <circle key={i} cx={cx + q[0] * ((R - L) / 2 - 10)} cy={level + ((q[1] + 1) / 2) * Math.max(4, BOTTOM - level - 12) + 4} r={3.6} style={{ fill: "var(--chem-solute)" }} />
        ))}
      </g>
    );
  };
  const mainL = dil ? W * 0.3 : 16;
  return (
    <div ref={box} dir="ltr" className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        {dil && beaker(12, W * 0.3 - 18, p.stockVolume, p.stockMolarity, "stock")}
        {beaker(mainL, BAR_X - 48, p.volume, p.molarity, "main")}
        <rect x={BAR_X - 6} y={TOP - 6} width={12} height={BOTTOM - TOP + 12} rx={6} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} strokeWidth={1} />
        <rect x={BAR_X - 6} y={yFor(p.volume)} width={12} height={BOTTOM - yFor(p.volume) + 6} rx={6} style={{ fill: liquidCss(p.molarity) }} />
        {[0, 1, 2, 3, 4, 5].map((tk) => (
          <text key={tk} x={BAR_X + 22} y={yFor(tk) + 4} style={{ fontSize: svgPx(12), fill: "var(--ph-ink-muted)" }}>
            {`${tk} L`}
          </text>
        ))}
      </svg>
      <SvgHandle x={BAR_X} y={yFor(s.value)} viewW={W} viewH={H} direction="vertical" label={label} valueText={valueText} s={s} drag={drag} testId="mol-hero-handle" />
    </div>
  );
}

/**
 * §44: the 3D scene at the top of the molarity Result card. The volume marker on the 0–5 L scale
 * writes back into the calculator (V, or V₂ when diluting), with its own − / + / reset.
 */
export default function MolarityResultScene({ p, seed, onSetVolume }: { p: SceneProps; seed: number; onSetVolume: (v: number) => void }) {
  const t = useTranslations("tools.molarity-calculator.visuals.hero");
  const value = snap(p.volume, 0.001, V_MIN, V_MAX);
  const set = useCallback((v: number) => onSetVolume(snap(v, V_STEP, V_MIN, V_MAX)), [onSetVolume]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + V_STEP),
    dec: () => set(value - V_STEP),
    reset: () => set(seed),
    flash: 0,
    atMin: value <= V_MIN,
    atMax: value >= V_MAX,
    isSeed: Math.abs(value - seed) < 1e-9,
    min: V_MIN,
    max: V_MAX,
    step: V_STEP,
  };
  const valueText = `${p.mode === "dilution" ? "V₂" : "V"} = ${g3(value)} L`;
  const [proj, setProj] = useState<MolProjection | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag3d = useAnchoredDrag(value, () => (proj ? [proj.top[0] - proj.bottom[0], proj.top[1] - proj.bottom[1]] : null), set, setDragging, V_MAX);
  const label = t(p.mode === "dilution" ? "handleDiluted" : "handle");

  return (
    <div data-ph-scene-block className="flex min-h-[340px] flex-1 flex-col gap-3 lg:min-h-[320px]">
      <ViewportScene
        testId="mol-hero"
        className="min-h-[280px] flex-1"
        fallback={<Scene2D s={s} valueText={valueText} label={label} p={p} />}
        render3d={() => (
          <div className="absolute inset-0" dir="ltr" data-testid="mol-hero-3d">
            <Scene3D {...p} dragging={dragging} onProject={setProj} />
            {proj && (
              <div data-testid="mol-hero-handle" className="absolute inset-0" style={{ pointerEvents: "none" }}>
                <div className="absolute h-11 w-11 touch-none" style={{ left: proj.marker[0], top: proj.marker[1], transform: "translate(-50%, -50%)", pointerEvents: "auto" }} {...drag3d}>
                  <GlassHandle direction="vertical" valueText={valueText} ariaLabel={label} onStep={(d) => (d > 0 ? s.inc() : s.dec())} valueNow={value} valueMin={V_MIN} valueMax={V_MAX} style={{ left: 0, top: 0 }} />
                </div>
              </div>
            )}
          </div>
        )}
      />
      <KitControls s={s} valueText={valueText} testId="mol-hero" />
    </div>
  );
}
