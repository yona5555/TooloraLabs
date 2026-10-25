"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { ENERGY_GRAVITY, fallAtTime } from "@tooloralabs/tools";
import EnergyIndicatorCard from "./EnergyIndicatorCard";
import { toInput, useEnergyLive, useEnergyModel } from "./EnergyLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 360;
const H = 248;
const TOP = 40;
const GROUND = 210;
const TOWER_X = 70;
const BAR_W = 46;
const BARS_X = [190, 248, 306] as const;
const HOLD = 0.9;

type Knob = "mass" | "height";
const RANGE: Record<Knob, [number, number]> = { mass: [-1, 4], height: [-1, 3] };
const UNIT: Record<Knob, string> = { mass: "kg", height: "m" };
const SYMBOL: Record<Knob, string> = { mass: "m", height: "h" };

/**
 * The page's "wow" piece: a ball dropped from rest at your height h. While it falls (½gt²), its
 * potential energy drains into kinetic energy and the total bar never moves. Very short or very
 * long falls are slowed down or sped up to stay watchable; the clock shows the real fall time.
 * Log sliders write m and h back into the calculator, so the Result card, the 3D drawing and
 * every indicator follow.
 */
export default function EnergyDropLab() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.drop");
  const { setDim } = useEnergyLive();
  const { potential: pa, f } = useEnergyModel();
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const start = useRef<number | null>(null);

  const tf = pa.fallTime;
  const play = Math.max(0.8, Math.min(4, tf));

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    start.current = null;
    const tick = (now: number) => {
      if (start.current === null && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        // Reduced motion: show the halfway state instead of running.
        setPhase(Math.SQRT1_2);
        setPlaying(false);
        return;
      }
      if (start.current === null) start.current = now - phase * play * 1000;
      const el = ((now - start.current) / 1000) % (play + HOLD);
      setPhase(Math.min(1, el / play));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when play toggles or the fall changes
  }, [playing, play]);

  const now = fallAtTime(pa.mass, pa.height, phase * tf);
  const total = Math.abs(pa.potentialEnergy) || 1e-30;
  const frac = pa.height > 0 ? now.height / pa.height : 0;
  const ballY = GROUND - 10 - frac * (GROUND - TOP - 10);
  const span = GROUND - TOP;
  const bars = [
    { label: "PE", value: now.potential, cls: "fill-blue-600 dark:fill-blue-400" },
    { label: "KE", value: now.kinetic, cls: "fill-emerald-500 dark:fill-emerald-400" },
    { label: t("total"), value: now.potential + now.kinetic, cls: "fill-zinc-500 dark:fill-zinc-400" },
  ];
  const valueOf: Record<Knob, number> = { mass: pa.mass, height: pa.height };

  const lab = (
    <div className="w-full max-w-[360px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <text style={{ fontSize: svgPx(13) }} x={W / 2} y={18} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
          {`t = ${f(now.time, 2)} s · v = ${f(now.speed, 2)} m/s`}
        </text>
        <line x1={10} y1={GROUND} x2={W - 10} y2={GROUND} strokeWidth={2} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {/* tower with height marks at h, h/2 and the ground */}
        <rect x={TOWER_X - 34} y={TOP} width={10} height={span} rx={2} className="fill-zinc-300 dark:fill-zinc-600" />
        <rect x={TOWER_X - 34} y={TOP - 3} width={34} height={5} rx={2} className="fill-zinc-400 dark:fill-zinc-500" />
        {[1, 0.5, 0].map((k) => (
          <g key={k}>
            <line x1={TOWER_X - 40} y1={GROUND - k * span} x2={TOWER_X - 24} y2={GROUND - k * span} className="stroke-zinc-400 dark:stroke-zinc-500" />
            <text style={{ fontSize: svgPx(12) }} x={TOWER_X - 44} y={GROUND - k * span + 4} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(pa.height * k, 2)}`}
            </text>
          </g>
        ))}
        <line x1={TOWER_X} y1={TOP} x2={TOWER_X} y2={GROUND} strokeDasharray="3 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
        <circle cx={TOWER_X} cy={ballY} r={10} className="fill-blue-600 dark:fill-blue-400" />
        <text style={{ fontSize: svgPx(12) }} x={TOWER_X} y={GROUND + 16} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {`${f(now.height, 2)} m`}
        </text>
        {/* energy bars: PE + KE = total */}
        {bars.map((b, i) => {
          const hh = (Math.abs(b.value) / total) * (span - 30);
          return (
            <g key={b.label}>
              <rect x={BARS_X[i] - BAR_W / 2} y={GROUND - hh} width={BAR_W} height={Math.max(1, hh)} rx={4} className={b.cls} />
              <text style={{ fontSize: svgPx(12) }} x={BARS_X[i]} y={GROUND - hh - 6} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
                {f(b.value, 1)}
              </text>
              <text style={{ fontSize: svgPx(12) }} x={BARS_X[i]} y={GROUND + 16} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
                {b.label}
              </text>
            </g>
          );
        })}
        <text style={{ fontSize: svgPx(12) }} x={BARS_X[1]} y={GROUND + 30} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {t("joules")}
        </text>
      </svg>
      <div className="mt-2 space-y-2">
        {(["mass", "height"] as Knob[]).map((k) => {
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
              <span dir="ltr" className="w-24 shrink-0 text-end font-mono">{`${f(valueOf[k])} ${UNIT[k]}`}</span>
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

  const half = fallAtTime(pa.mass, pa.height, tf / Math.SQRT2);
  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={lab}
      rows={[
        { label: "PE = m g h", value: `${f(pa.mass)} × ${ENERGY_GRAVITY} × ${f(pa.height)} = ${f(pa.potentialEnergy)} J` },
        { label: t("halfway"), value: `PE ${f(half.potential)} J + KE ${f(half.kinetic)} J` },
        { label: t("fallTime"), value: `√(2h/g) = ${f(tf)} s` },
        { label: t("impact"), value: `√(2gh) = ${f(pa.impactSpeed)} m/s`, emphasize: true, note: t("conserved") },
      ]}
    />
  );
}
