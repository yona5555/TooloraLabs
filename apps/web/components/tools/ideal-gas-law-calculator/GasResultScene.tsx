"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { GlassHandle } from "@/components/tool-ui/glass/GlassPrimitives";
import { KitControls, SvgHandle, useMeasuredSize, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { useAnchoredDrag } from "@/components/tool-ui/indicator-kit/useAnchoredDrag";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { ballPoints, snap } from "@/components/tool-ui/indicator-kit/format";
import { g4, pistonFrac, T_MAX, T_MIN, T_STEP, tempCss } from "./gasMath";
import type { GasProjection } from "./GasResultScene3D";

const Scene3D = dynamic(() => import("./GasResultScene3D"), { ssr: false, loading: () => null });
const PTS = ballPoints(64, 23);

type SceneProps = { volume: number; temperature: number; particles: number };

/** 2D twin of the 3D piston (no WebGL or no free slot): same piston height, particles and 0–600 K scale. */
function Scene2D({ s, valueText, label, p }: { s: Stepper; valueText: string; label: string; p: SceneProps }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 380, h: 320 });
  const BAR_X = W - 64;
  const TOP = 22;
  const BOTTOM = H - 30;
  const yT = (t: number) => BOTTOM - (Math.min(t, T_MAX) / T_MAX) * (BOTTOM - TOP);
  const drag = useAnchoredDrag(s.value, () => [0, -(BOTTOM - TOP)], s.set, undefined, T_MAX);
  const L = 16;
  const R = BAR_X - 52;
  const piston = BOTTOM - pistonFrac(p.volume) * (BOTTOM - TOP - 14);
  return (
    <div ref={box} dir="ltr" className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
        <path d={`M ${L} ${TOP} L ${L} ${BOTTOM - 12} Q ${L} ${BOTTOM} ${L + 12} ${BOTTOM} L ${R - 12} ${BOTTOM} Q ${R} ${BOTTOM} ${R} ${BOTTOM - 12} L ${R} ${TOP}`} fill="none" style={{ stroke: "var(--ph-line)" }} strokeWidth={2.5} strokeLinecap="round" />
        <rect x={L + 3} y={piston - 10} width={R - L - 6} height={10} rx={5} style={{ fill: "var(--chem-piston)" }} />
        <rect x={(L + R) / 2 - 4} y={TOP - 14} width={8} height={Math.max(4, piston - TOP + 4)} rx={4} style={{ fill: "var(--chem-piston)" }} />
        {PTS.slice(0, p.particles).map((q, i) => (
          <circle key={i} cx={(L + R) / 2 + q[0] * ((R - L) / 2 - 12)} cy={piston + ((q[1] + 1) / 2) * Math.max(4, BOTTOM - piston - 16) + 6} r={3.8} style={{ fill: tempCss(p.temperature) }} />
        ))}
        <rect x={BAR_X - 6} y={TOP - 6} width={12} height={BOTTOM - TOP + 12} rx={6} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} strokeWidth={1} />
        <rect x={BAR_X - 6} y={yT(p.temperature)} width={12} height={BOTTOM - yT(p.temperature) + 6} rx={6} style={{ fill: tempCss(p.temperature) }} />
        {[0, 100, 200, 300, 400, 500, 600].map((tk) => (
          <text key={tk} x={BAR_X + 20} y={yT(tk) + 4} fontSize={11} style={{ fill: "var(--ph-ink-muted)" }}>
            {`${tk} K`}
          </text>
        ))}
      </svg>
      <SvgHandle x={BAR_X} y={yT(s.value)} viewW={W} viewH={H} direction="vertical" label={label} valueText={valueText} s={s} drag={drag} testId="gas-hero-handle" />
    </div>
  );
}

/**
 * §44: the 3D scene at the top of the gas law Result card. The thermometer marker writes the
 * temperature back into the calculator (the piston follows), with its own − / + / reset.
 */
export default function GasResultScene({ p, seed, onSetTemperature }: { p: SceneProps; seed: number; onSetTemperature: (t: number) => void }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.hero");
  const value = snap(p.temperature, 0.01, T_MIN, T_MAX);
  const set = useCallback((v: number) => onSetTemperature(snap(v, T_STEP, T_MIN, T_MAX)), [onSetTemperature]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + T_STEP),
    dec: () => set(value - T_STEP),
    reset: () => onSetTemperature(seed),
    flash: 0,
    atMin: value <= T_MIN,
    atMax: value >= T_MAX,
    isSeed: Math.abs(value - seed) < 1e-9,
    min: T_MIN,
    max: T_MAX,
    step: T_STEP,
  };
  const valueText = `T = ${g4(value)} K`;
  const [proj, setProj] = useState<GasProjection | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag3d = useAnchoredDrag(value, () => (proj ? [proj.top[0] - proj.bottom[0], proj.top[1] - proj.bottom[1]] : null), set, setDragging, T_MAX);

  return (
    <div data-ph-scene-block className="flex min-h-[340px] flex-1 flex-col gap-3 lg:min-h-[320px]">
      <ViewportScene
        testId="gas-hero"
        className="min-h-[280px] flex-1"
        fallback={<Scene2D s={s} valueText={valueText} label={t("handle")} p={p} />}
        render3d={() => (
          <div className="absolute inset-0" dir="ltr" data-testid="gas-hero-3d">
            <Scene3D {...p} dragging={dragging} onProject={setProj} />
            {proj && (
              <div data-testid="gas-hero-handle" aria-valuetext={valueText} className="absolute inset-0" style={{ pointerEvents: "none" }}>
                <div className="absolute h-11 w-11 touch-none" style={{ left: proj.marker[0], top: proj.marker[1], transform: "translate(-50%, -50%)", pointerEvents: "auto" }} {...drag3d}>
                  <GlassHandle direction="vertical" ariaLabel={t("handle")} onStep={(d) => (d > 0 ? s.inc() : s.dec())} valueNow={value} valueMin={T_MIN} valueMax={T_MAX} style={{ left: 0, top: 0 }} />
                </div>
              </div>
            )}
          </div>
        )}
      />
      <KitControls s={s} valueText={valueText} testId="gas-hero" />
    </div>
  );
}
