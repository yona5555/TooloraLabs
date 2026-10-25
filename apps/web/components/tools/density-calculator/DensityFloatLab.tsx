"use client";
import { useEffect, useRef, useState, useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { niceCeil, STANDARD_GRAVITY } from "@tooloralabs/tools";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { ltr, SvgSubs } from "@/components/tool-ui/MixedText";
import { toInput, useDensityLive, useDensityModel } from "./DensityLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 360;
const H = 304;
const TX = 40;
const TANK = 280;
const RIM = 112;
const SURFACE = 172;
const FLOOR = 272;
const START = 104;
const FALL = 0.45; // seconds from release to touching the surface
const RUN = 3.2;
const HOLD = 1;

type Knob = "mass" | "volume" | "density";
const RANGE: Record<Knob, [number, number]> = { mass: [-2, 6], volume: [-2, 6], density: [-3, 1.4] };
const UNIT: Record<Knob, string> = { mass: "g", volume: "cm³", density: "g/cm³" };
const SYMBOL: Record<Knob, string> = { mass: "m", volume: "V", density: "ρ" };
const SOLVED: Record<string, Knob> = { solveDensity: "density", solveMass: "mass", solveVolume: "volume" };

/**
 * The page's "wow" piece: the cube of your material (drawn to true scale against a round-number
 * tank width) is dropped into a tank of the chosen real liquid. It bobs to rest at ρ/ρ_f of its
 * height under the surface, or sinks to the floor; the buoyant force ρ_f V_sub g₀ grows live as it
 * goes under. Log sliders write the known values back into the calculator, so the Result card,
 * the 3D tank and every indicator follow.
 */
export default function DensityFloatLab() {
  const svgId = useId();
  const t = useTranslations("tools.density-calculator.education.lab.float");
  const rtl = useLocale() === "ar";
  const tFluids = useTranslations("tools.density-calculator.live3d.fluids");
  const { setDim } = useDensityLive();
  const { draft, a, f } = useDensityModel();
  const [fluidKey, setFluidKey] = useState("water");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    start.current = null;
    const tick = (now: number) => {
      if (start.current === null && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        // Reduced motion: show the resting state instead of running.
        setTime(RUN);
        setPlaying(false);
        return;
      }
      if (start.current === null) start.current = now;
      const el = ((now - start.current) / 1000) % (RUN + HOLD);
      setTime(Math.min(RUN, el));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, fluidKey]);

  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const fluid = a.fluids.find((fl) => fl.key === fluidKey) ?? a.fluids[0];
  const tankCm = niceCeil(3 * a.cubeEdge);
  const s = (a.cubeEdge / tankCm) * TANK;
  const yEq = fluid.floats ? SURFACE + fluid.submergedFraction * s : FLOOR;

  // Bottom edge of the cube over time: free fall to the surface, then a damped bob or a sink.
  let y: number;
  if (time < FALL) {
    y = START + (SURFACE - START) * (time / FALL) ** 2;
  } else {
    const tau = time - FALL;
    if (fluid.floats) {
      y = yEq + (SURFACE - yEq) * Math.exp(-2.2 * tau) * Math.cos(4.5 * tau);
    } else {
      const k = 1.2 + 3 * (1 - fluid.fluidDensity / a.density);
      y = SURFACE + (FLOOR - SURFACE) * Math.min(1, 1.08 * (1 - Math.exp(-k * tau)));
    }
  }
  y = Math.min(FLOOR, y);
  const under = Math.max(0, Math.min(1, (y - SURFACE) / s));
  const buoyNow = ((fluid.fluidDensity * a.volume * under) / 1000) * STANDARD_GRAVITY;
  const maxF = Math.max(a.weight, ((fluid.fluidDensity * a.volume) / 1000) * STANDARD_GRAVITY, 1e-30);
  const arrow = (F: number) => 8 + 56 * (F / maxF);
  const cx = TX + TANK / 2 - 20;
  const knobs = (["mass", "volume", "density"] as Knob[]).filter((k) => k !== SOLVED[draft.operation]);
  const valueOf: Record<Knob, number> = { mass: a.mass, volume: a.volume, density: a.density };

  const lab = (
    <div className="w-full max-w-[360px]">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {a.fluids.map((fl) => (
          <button
            key={fl.key}
            type="button"
            aria-pressed={fl.key === fluid.key}
            onClick={() => setFluidKey(fl.key)}
            className={`rounded-lg border px-2 py-1 text-xs font-medium transition ${
              fl.key === fluid.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {tFluids(fl.key)}
          </button>
        ))}
      </div>
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <text style={{ fontSize: svgPx(13) }} x={4} y={16} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
          {`t = ${time.toFixed(2)} s`}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={W - 4} y={16} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          <SvgSubs text={`ρ = ${f(a.density)} · ρ_f = ${f(fluid.fluidDensity)} g/cm³`} />
        </text>
        <text style={{ fontSize: svgPx(12) }} x={4} y={36} fontFamily="ui-monospace, monospace" className="fill-emerald-700 dark:fill-emerald-400">
          <SvgSubs text={`F_b = ${f(buoyNow, 3)} N`} />
        </text>
        <text style={{ fontSize: svgPx(12) }} x={W - 4} y={36} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
          {`W = ${f(a.weight, 3)} N`}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={rtl ? W - 4 : 4} y={54} direction={rtl ? "rtl" : "ltr"} fontWeight={600} className="fill-violet-700 dark:fill-violet-300">
          {t("underNow", { p: ltr(`${f(under * 100, 1)} %`) })}
        </text>
        {/* liquid and tank */}
        <rect x={TX} y={SURFACE} width={TANK} height={FLOOR - SURFACE} className="fill-sky-300/40 dark:fill-sky-500/25" />
        <line x1={TX} y1={SURFACE} x2={TX + TANK} y2={SURFACE} strokeWidth={2} className="stroke-sky-500 dark:stroke-sky-400" />
        <path d={`M${TX},${RIM} V${FLOOR} H${TX + TANK} V${RIM}`} fill="none" strokeWidth={2.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
        <text style={{ fontSize: svgPx(12) }} x={TX + TANK - 8} y={SURFACE + 16} textAnchor="end" fontWeight={600} className="fill-sky-700 dark:fill-sky-300">
          {tFluids(fluid.key)}
        </text>
        {/* resting waterline target */}
        <line x1={cx - s / 2 - 10} y1={yEq} x2={cx + s / 2 + 10} y2={yEq} strokeDasharray="4 3" strokeWidth={1} className="stroke-violet-500 dark:stroke-violet-400" />
        {/* the cube, true scale against the tank */}
        <rect x={cx - s / 2} y={y - s} width={s} height={s} rx={2} className="fill-amber-500 stroke-amber-700 dark:fill-amber-400 dark:stroke-amber-300" strokeWidth={1.5} />
        {under > 0 && <rect x={cx - s / 2} y={SURFACE} width={s} height={Math.min(s, y - SURFACE)} className="fill-sky-600/25" />}
        {/* forces */}
        <line x1={cx + s / 2 + 12} y1={y - s / 2} x2={cx + s / 2 + 12} y2={y - s / 2 + arrow(a.weight)} strokeWidth={3} markerEnd={`url(#${svgId}density-lab-w)`} className="stroke-red-600 dark:stroke-red-400" />
        {buoyNow > 0 && (
          <line x1={cx - s / 2 - 12} y1={y - s / 2} x2={cx - s / 2 - 12} y2={y - s / 2 - arrow(buoyNow)} strokeWidth={3} markerEnd={`url(#${svgId}density-lab-b)`} className="stroke-emerald-600 dark:stroke-emerald-400" />
        )}
        {/* true-scale ruler */}
        <line x1={TX} y1={FLOOR + 8} x2={TX + TANK} y2={FLOOR + 8} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={TX + (TANK * i) / 10} y1={FLOOR + 8} x2={TX + (TANK * i) / 10} y2={FLOOR + (i % 5 === 0 ? 14 : 11)} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
        ))}
        {/* axis labels sit a clear 8 px under the ruler ticks, never on the tank's bottom line */}
        <text style={{ fontSize: svgPx(12) }} x={TX} y={H - 3} className="fill-zinc-500 dark:fill-zinc-400">
          0
        </text>
        <text style={{ fontSize: svgPx(12) }} x={TX + TANK} y={H - 3} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {`${f(tankCm)} cm · a = ${f(a.cubeEdge, 3)} cm`}
        </text>
        <defs>
          <marker id={`${svgId}density-lab-w`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-red-600 dark:fill-red-400" />
          </marker>
          <marker id={`${svgId}density-lab-b`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-emerald-600 dark:fill-emerald-400" />
          </marker>
        </defs>
      </svg>
      <div className="mt-2 space-y-2">
        {knobs.map((k) => {
          const [lo, hi] = RANGE[k];
          const v = Math.max(lo, Math.min(hi, Math.log10(Math.max(Math.abs(valueOf[k]), 1e-12))));
          return (
            <label key={k} className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span dir="ltr" className="w-6 shrink-0 font-mono font-semibold">{SYMBOL[k]}</span>
              <input
                type="range"
                dir="ltr"
                min={lo}
                max={hi}
                step={0.01}
                value={v}
                aria-label={t(`slider.${k}`)}
                onChange={(e) => setDim(k, toInput(10 ** Number(e.target.value)))}
                className="h-2 min-w-0 flex-1 cursor-pointer accent-blue-600"
              />
              <span dir="ltr" className="w-28 shrink-0 text-end font-mono">{`${f(valueOf[k])} ${UNIT[k]}`}</span>
            </label>
          );
        })}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? t("pause") : t("play")}
        </button>
      </div>
    </div>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={lab}
      rows={[
        { label: fluid.floats ? t("floats") : t("sinks"), value: `${f(a.density)} ${fluid.floats ? "<" : "≥"} ${f(fluid.fluidDensity)} g/cm³` },
        { label: t("submerged"), value: fluid.floats ? `${f(a.density)} / ${f(fluid.fluidDensity)} = ${f(fluid.submergedFraction * 100, 1)} %` : "100 %", emphasize: true },
        { label: t("weight"), value: `${f(a.massKg)} kg × ${STANDARD_GRAVITY} = ${f(a.weight, 3)} N` },
        { label: t("buoyancy"), value: `${f(fluid.buoyantForce, 3)} N`, note: fluid.floats ? t("balancedNote") : t("sunkNote", { n: f(fluid.apparentWeight, 3) }) },
      ]}
    />
  );
}
