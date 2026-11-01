"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { kinematicsStateAt } from "@tooloralabs/tools";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { r2, toInput, useKinLive, useKinModel, type KinDraft } from "./KinLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 400;
const H = 330;
const L = 44;
const R = 388;
const TRACK_Y = 62;
const PLOTS = [
  { top: 104, bottom: 196 },
  { top: 228, bottom: 312 },
] as const;
const SAMPLES = 48;

type Knob = "v0" | "v" | "a" | "t" | "dx";
const RANGE: Record<Knob, [number, number, number]> = { v0: [-40, 100, 0.5], v: [-40, 100, 0.5], a: [-10, 10, 0.1], t: [0.5, 60, 0.5], dx: [1, 500, 1] };
const UNIT: Record<Knob, string> = { v0: "m/s", v: "m/s", a: "m/s²", t: "s", dx: "m" };
const SYMBOL: Record<Knob, string> = { v0: "v₀", v: "v", a: "a", t: "t", dx: "Δx" };

/**
 * Type #7 (Trend Line with Highlighted Reference Point) and the page's "wow" piece: the live
 * motion runs as an animation. A car drives along the track (1 real second per simulated second,
 * clamped to 2–6 s per run) while its v–t line and x–t parabola are traced up to the current
 * instant, the moving dot being the highlighted point. The sliders rewrite the known values in
 * the calculator, so the Result card, the 3D drawing and every indicator follow.
 */
export default function KinMotionLab() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.motion");
  const { setDim } = useKinLive();
  const { draft, k, solved, f } = useKinModel();
  const [u, setU] = useState(0.45);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const run = k ? Math.min(6, Math.max(2, k.span)) : 3;

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let hold = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setU((prev) => {
        if (prev >= 1) {
          hold += dt;
          if (hold < 0.8) return 1;
          hold = 0;
          return 0;
        }
        return Math.min(1, prev + dt / run);
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, run]);

  if (!k || k.span <= 0) return <KinIndicatorUnavailable title={t("title")} />;

  const span = k.span;
  const now = kinematicsStateAt(k.v0, k.a, u * span);
  const curve = Array.from({ length: SAMPLES + 1 }, (_, i) => kinematicsStateAt(k.v0, k.a, (span * i) / SAMPLES));
  const xs = curve.map((s) => s.x);
  const vs = curve.map((s) => s.v);
  const xLo = Math.min(0, ...xs);
  const xHi = Math.max(0, ...xs);
  const vLo = Math.min(0, ...vs);
  const vHi = Math.max(0, ...vs);
  const px = (time: number) => r2(L + (time / span) * (R - L));
  const trackX = (x: number) => r2(L + (xHi - xLo > 1e-12 ? ((x - xLo) / (xHi - xLo)) * (R - L - 30) : 0));
  const py = (val: number, lo: number, hi: number, p: (typeof PLOTS)[number]) => r2(p.bottom - (hi - lo > 1e-12 ? ((val - lo) / (hi - lo)) * (p.bottom - p.top) : 0.5 * (p.bottom - p.top)));
  const path = (key: "v" | "x", upTo: number, p: (typeof PLOTS)[number], lo: number, hi: number) =>
    curve
      .filter((s) => s.t <= upTo + 1e-9)
      .concat(upTo < span ? [kinematicsStateAt(k.v0, k.a, upTo)] : [])
      .map((s, i) => `${i ? "L" : "M"}${px(s.t)},${py(s[key], lo, hi, p)}`)
      .join(" ");

  const plots = [
    { key: "v" as const, lo: vLo, hi: vHi, p: PLOTS[0], label: "v (m/s)", cls: "stroke-violet-600 dark:stroke-violet-400", dot: "fill-violet-600 dark:fill-violet-400", value: now.v },
    { key: "x" as const, lo: xLo, hi: xHi, p: PLOTS[1], label: "x (m)", cls: "stroke-blue-600 dark:stroke-blue-400", dot: "fill-blue-600 dark:fill-blue-400", value: now.x },
  ];
  const carX = trackX(now.x);
  const back = now.v < 0;

  const inputs: Knob[] = (draft.mode === "timeBased" ? (["v0", "v", "a", "t"] as Knob[]) : (["v0", "v", "a", "dx"] as Knob[])).filter((q) => q !== solved);
  const valueOf: Record<Knob, number> = { v0: k.v0, v: k.v, a: k.a, t: k.t, dx: k.dx };

  const lab = (
    <div className="w-full max-w-[400px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <text style={{ fontSize: svgPx(13) }} x={W / 2} y={16} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
          {`t = ${f(now.t, 2)} s · v = ${f(now.v, 1)} m/s · x = ${f(now.x, 1)} m`}
        </text>
        {/* track with the eight equal-time stations */}
        <line x1={L} y1={TRACK_Y} x2={R} y2={TRACK_Y} strokeWidth={2} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {k.steps.map((s, i) => (
          <line key={i} x1={trackX(s.x) + 15} y1={TRACK_Y} x2={trackX(s.x) + 15} y2={TRACK_Y + 6} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
        ))}
        <g transform={`translate(${carX},${TRACK_Y - 18})`}>
          <g transform={back ? "translate(30,0) scale(-1,1)" : undefined}>
            <rect x={0} y={4} width={30} height={10} rx={3} className="fill-blue-600 dark:fill-blue-400" />
            <rect x={6} y={0} width={14} height={7} rx={2} className="fill-blue-500 dark:fill-blue-300" />
            <circle cx={7} cy={15} r={3.5} className="fill-zinc-700 dark:fill-zinc-300" />
            <circle cx={23} cy={15} r={3.5} className="fill-zinc-700 dark:fill-zinc-300" />
          </g>
        </g>
        {plots.map((pl) => {
          const zero = py(0, pl.lo, pl.hi, pl.p);
          return (
            <g key={pl.key}>
              <line x1={L} y1={pl.p.top} x2={L} y2={pl.p.bottom} className="stroke-zinc-300 dark:stroke-zinc-600" />
              <line x1={L} y1={zero} x2={R} y2={zero} className="stroke-zinc-300 dark:stroke-zinc-600" />
              <text style={{ fontSize: svgPx(12) }} x={L - 4} y={pl.p.top + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{f(pl.hi, 1)}</text>
              <text style={{ fontSize: svgPx(12) }} x={L - 4} y={pl.p.bottom + 3} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{f(pl.lo, 1)}</text>
              <text style={{ fontSize: svgPx(12) }} x={L + 4} y={pl.p.top - 5} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">{pl.label}</text>
              <path d={path(pl.key, span, pl.p, pl.lo, pl.hi)} fill="none" strokeWidth={1.5} strokeDasharray="4 3" className="stroke-zinc-300 dark:stroke-zinc-600" />
              <path d={path(pl.key, now.t, pl.p, pl.lo, pl.hi)} fill="none" strokeWidth={2.5} className={pl.cls} />
              <circle cx={px(now.t)} cy={py(pl.value, pl.lo, pl.hi, pl.p)} r={5} strokeWidth={2} className={`${pl.dot} stroke-white dark:stroke-zinc-900`} />
            </g>
          );
        })}
        <text style={{ fontSize: svgPx(12) }} x={R} y={PLOTS[1].bottom + 14} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{`t (s) → ${f(span, 2)}`}</text>
      </svg>
      <div className="mt-2 space-y-2">
        {inputs.map((q) => {
          const [lo, hi, step] = RANGE[q];
          const v = Math.max(lo, Math.min(hi, valueOf[q]));
          return (
            <label key={q} className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span dir="ltr" className="w-6 shrink-0 font-mono font-semibold">{SYMBOL[q]}</span>
              <input
                type="range"
                dir="ltr"
                min={lo}
                max={hi}
                step={step}
                value={v}
                aria-label={t(`slider.${q}`)}
                onChange={(e) => setDim(q as keyof KinDraft, toInput(Number(e.target.value)))}
                className="h-2 min-w-0 flex-1 cursor-pointer accent-blue-600"
              />
              <span dir="ltr" className="w-24 shrink-0 text-end font-mono">{`${f(valueOf[q])} ${UNIT[q]}`}</span>
            </label>
          );
        })}
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? t("pause") : t("play")}
        </button>
      </div>
    </div>
  );

  return (
    <KinIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={lab}
      rows={[
        { label: t("instant"), value: `t = ${f(now.t, 2)} s` },
        { label: t("velocity"), value: `${f(k.v0)} + ${f(k.a)} × ${f(now.t, 2)} = ${f(now.v)} m/s` },
        { label: t("position"), value: `${f(k.v0)} × ${f(now.t, 2)} + ½ × ${f(k.a)} × ${f(now.t, 2)}² = ${f(now.x)} m` },
        { label: t("end"), value: `v = ${f(k.steps[k.steps.length - 1].v)} m/s · x = ${f(k.steps[k.steps.length - 1].x)} m`, emphasize: true, note: t("endNote") },
      ]}
    />
  );
}
