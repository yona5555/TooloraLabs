"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { kinematicsAt } from "@tooloralabs/tools";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { toInput, useForceLive, useForceModel } from "./ForceLiveContext";

const W = 360;
const H = 200;
const X0 = 40;
const TRACK = 300;
const BLOCK = 26;
const RUN = 4; // seconds of motion shown, in real time
const HOLD = 0.8;
const LANES = [62, 142] as const;

type Knob = "force" | "mass" | "acceleration";
const RANGE: Record<Knob, [number, number]> = { force: [-1, 8], mass: [-2, 7], acceleration: [-2, 3] };
const UNIT: Record<Knob, string> = { force: "N", mass: "kg", acceleration: "m/s²" };
const SYMBOL: Record<Knob, string> = { force: "F", mass: "m", acceleration: "a" };

/**
 * The page's "wow" piece: two blocks start from rest under the same force — your mass m and 2m —
 * and run for 4 real seconds. x = ½at² makes the 1-second strobe ticks spread out, and the 2m
 * block covers exactly half the distance. Log sliders write the two known values back into the
 * calculator, so the Result card, the 3D drawing and every indicator follow.
 */
export default function ForcePushLab() {
  const t = useTranslations("tools.force-calculator.education.lab.push");
  const { setDim } = useForceLive();
  const { draft, sl, f } = useForceModel();
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    start.current = null;
    const tick = (now: number) => {
      if (start.current === null && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        // Reduced motion: show the end state (t = 4 s) instead of running.
        setTime(RUN);
        setPlaying(false);
        return;
      }
      if (start.current === null) start.current = now - time * 1000;
      const el = ((now - start.current) / 1000) % (RUN + HOLD);
      setTime(Math.min(RUN, el));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when play toggles
  }, [playing]);

  if (!sl) return <ForceIndicatorUnavailable title={t("title")} />;

  const a = sl.acceleration;
  const lane = [
    { label: `m = ${f(sl.mass)} kg`, now: kinematicsAt(sl.force, sl.mass, a, time), share: 1 },
    { label: `2m = ${f(sl.mass * 2)} kg`, now: kinematicsAt(sl.force, sl.mass * 2, a / 2, time), share: 0.5 },
  ];
  const full = Math.abs(0.5 * a * RUN * RUN);
  const frac = (x: number) => (full > 0 ? Math.abs(x) / full : 0);
  const knobs = (["force", "mass", "acceleration"] as Knob[]).filter((k) => k !== draft.slSolve);
  const valueOf: Record<Knob, number> = { force: sl.force, mass: sl.mass, acceleration: sl.acceleration };

  const lab = (
    <div className="w-full max-w-[360px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <text x={W / 2} y={18} textAnchor="middle" fontSize={14} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
          {`t = ${time.toFixed(2)} s`}
        </text>
        {lane.map((ln, i) => {
          const y = LANES[i];
          const bx = X0 + frac(ln.now.x) * (TRACK - BLOCK);
          return (
            <g key={i}>
              <text x={X0} y={y - 32} fontSize={11} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
                {ln.label}
              </text>
              <text x={X0 + TRACK} y={y - 32} textAnchor="end" fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
                {`v = ${f(ln.now.v, 2)} m/s · x = ${f(ln.now.x, 2)} m`}
              </text>
              <line x1={X0} y1={y} x2={X0 + TRACK} y2={y} strokeWidth={2} className="stroke-zinc-300 dark:stroke-zinc-600" />
              {[1, 2, 3, 4].map((s) => {
                const tx = X0 + ln.share * (s * s) / 16 * (TRACK - BLOCK) + BLOCK / 2;
                return (
                  <g key={s}>
                    <line x1={tx} y1={y} x2={tx} y2={y + 6} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
                    {s >= 2 && (i === 0 || s === 4) && (
                      <text x={tx} y={y + 17} textAnchor="middle" fontSize={9} className="fill-zinc-400 dark:fill-zinc-500">
                        {`${s} s`}
                      </text>
                    )}
                  </g>
                );
              })}
              <rect x={bx} y={y - BLOCK} width={BLOCK} height={BLOCK} rx={4} className={i === 0 ? "fill-blue-600 dark:fill-blue-400" : "fill-amber-500 dark:fill-amber-400"} />
              <line x1={bx - 22} y1={y - BLOCK / 2} x2={bx - 4} y2={y - BLOCK / 2} strokeWidth={3} markerEnd="url(#force-push-head)" className="stroke-red-600 dark:stroke-red-400" />
            </g>
          );
        })}
        <defs>
          <marker id="force-push-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-red-600 dark:fill-red-400" />
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

  const end = kinematicsAt(sl.force, sl.mass, a, RUN);
  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={lab}
      rows={[
        { label: t("accel"), value: `${f(sl.force)} / ${f(sl.mass)} = ${f(a)} m/s²` },
        { label: t("distance4"), value: `½ × ${f(a)} × 4² = ${f(end.x)} m` },
        { label: t("speed4"), value: `${f(a)} × 4 = ${f(end.v)} m/s` },
        { label: t("double"), value: `${f(a / 2)} m/s² → ${f(end.x / 2)} m`, emphasize: true, note: t("halfNote") },
      ]}
    />
  );
}
