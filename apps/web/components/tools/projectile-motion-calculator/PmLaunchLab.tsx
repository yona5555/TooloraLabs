"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { projectileStateAt, sampleTrajectory } from "@tooloralabs/tools";
import PmIndicatorCard from "./PmIndicatorCard";
import { r2, usePmLive, usePmModel } from "./PmLiveContext";

const W = 400;
const H = 260;
const L = 40;
const R = 390;
const T = 16;
const B = 228;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function readMotion() {
  return window.matchMedia(MOTION_QUERY).matches;
}

export function niceCeil(v: number): number {
  if (!(v > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 1.2 ? 1.2 : m <= 1.5 ? 1.5 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 3 ? 3 : m <= 4 ? 4 : m <= 5 ? 5 : m <= 6 ? 6 : m <= 8 ? 8 : 10) * p;
}

/**
 * Type #7 (Trend Line with Highlighted Reference Point) and the page's "wow" piece: a running
 * physics animation of the live launch. The ball flies along the real parabola in real time
 * (clamped to 1.5–5 s per flight), trailing its path, with its velocity vector and vₓ / vy
 * components; the apex is the highlighted reference point. The two sliders rewrite v₀ and θ
 * in the calculator, so the Result card, the 3D drawing and every indicator move with them,
 * and the worked-example table reads the ball's state at the current instant.
 */
export default function PmLaunchLab() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.launch");
  const { setDim } = usePmLive();
  const { a, f } = usePmModel();
  const [u, setU] = useState(0.38);
  const [choice, setChoice] = useState<boolean | null>(null);
  // Server snapshot "reduce" keeps the SSR frame still; the browser then plays unless the visitor prefers reduced motion.
  const reduceMotion = useSyncExternalStore(subscribeMotion, readMotion, () => true);
  const playing = choice ?? !reduceMotion;
  const raf = useRef<number | null>(null);
  const flight = a ? Math.min(5, Math.max(1.5, a.timeOfFlight)) : 2;

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
          if (hold < 0.7) return 1;
          hold = 0;
          return 0;
        }
        return Math.min(1, prev + dt / flight);
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, flight]);

  if (!a) return null;

  const xMax = niceCeil(Math.max(a.range, a.apexX, 1e-6) * 1.08);
  const yMax = niceCeil(Math.max(a.maxHeight, 1e-6) * 1.15);
  const px = (x: number) => r2(L + (x / xMax) * (R - L));
  const py = (y: number) => r2(B - (y / yMax) * (B - T));
  const pts = sampleTrajectory(a, 80);
  const d = pts.map((q, i) => `${i ? "L" : "M"}${px(q.x)},${py(q.y)}`).join(" ");
  const now = projectileStateAt(a, u * a.timeOfFlight);
  const trail = sampleTrajectory(a, 80)
    .filter((q) => q.t <= now.t + 1e-9)
    .map((q, i) => `${i ? "L" : "M"}${px(q.x)},${py(q.y)}`)
    .join(" ");
  const k = a.timeOfFlight * 0.16;
  const ball = { x: px(now.x), y: py(now.y) };
  const tip = { x: px(now.x + now.vx * k), y: py(now.y + now.vy * k) };
  const hx = { x: px(now.x + now.vx * k), y: ball.y };
  const vyTip = { x: ball.x, y: py(now.y + now.vy * k) };
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((s) => s * xMax);
  const yTicks = [0, 0.5, 1].map((s) => s * yMax);

  const svg = (
    <div className="w-full max-w-[400px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <defs>
          <marker id="pm-lab-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="fill-red-600 dark:fill-red-400" />
          </marker>
          <clipPath id="pm-lab-clip">
            <rect x={L} y={0} width={W - L} height={B} />
          </clipPath>
        </defs>
        {xTicks.map((x) => (
          <g key={`x${x}`}>
            <line x1={px(x)} y1={T} x2={px(x)} y2={B} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={px(x)} y={B + 14} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{f(x, 1)}</text>
          </g>
        ))}
        {yTicks.map((y) => (
          <g key={`y${y}`}>
            <line x1={L} y1={py(y)} x2={R} y2={py(y)} className="stroke-zinc-200 dark:stroke-zinc-700" />
            <text x={L - 5} y={py(y) + 3} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{f(y, 1)}</text>
          </g>
        ))}
        <text x={R} y={B + 28} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">x (m)</text>
        <text x={L + 4} y={T - 4} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">y (m)</text>
        <path d={d} fill="none" strokeWidth={1.5} strokeDasharray="4 4" className="stroke-zinc-400 dark:stroke-zinc-500" />
        {trail && <path d={trail} fill="none" strokeWidth={3} className="stroke-blue-600 dark:stroke-blue-400" />}
        {/* apex: the highlighted reference point */}
        <line x1={px(a.apexX)} y1={py(a.maxHeight)} x2={px(a.apexX)} y2={B} strokeDasharray="3 3" className="stroke-amber-500 dark:stroke-amber-400" />
        <circle cx={px(a.apexX)} cy={py(a.maxHeight)} r={5} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" strokeWidth={1.5} />
        <text x={px(a.apexX)} y={py(a.maxHeight) - 9} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
          {`h_max ${f(a.maxHeight)} m`}
        </text>
        <g clipPath="url(#pm-lab-clip)">
        <line x1={ball.x} y1={ball.y} x2={hx.x} y2={hx.y} strokeWidth={2} className="stroke-violet-600 dark:stroke-violet-400" />
        <line x1={ball.x} y1={ball.y} x2={vyTip.x} y2={vyTip.y} strokeWidth={2} className="stroke-emerald-600 dark:stroke-emerald-400" />
        <line x1={ball.x} y1={ball.y} x2={tip.x} y2={tip.y} strokeWidth={2.5} markerEnd="url(#pm-lab-head)" className="stroke-red-600 dark:stroke-red-400" />
        </g>
        <circle cx={ball.x} cy={ball.y} r={7} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={2} />
      </svg>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setChoice(!playing)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          {playing ? t("pause") : t("play")}
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
      </div>
      <label className="mt-3 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <span className="flex justify-between">
          <span>{t("speed")}</span>
          <span dir="ltr" className="font-mono">{`${f(a.speed, 1)} m/s`}</span>
        </span>
        <input
          type="range"
          min={1}
          max={150}
          step={0.5}
          value={Math.min(150, Math.max(1, a.speed))}
          onChange={(e) => setDim("speed", e.target.value)}
          className="mt-1 w-full accent-blue-600"
        />
      </label>
      <label className="mt-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <span className="flex justify-between">
          <span>{t("angle")}</span>
          <span dir="ltr" className="font-mono">{`${f(a.angle, 1)}°`}</span>
        </span>
        <input
          type="range"
          min={0}
          max={90}
          step={0.5}
          value={Math.min(90, Math.max(0, a.angle))}
          onChange={(e) => setDim("angle", e.target.value)}
          className="mt-1 w-full accent-blue-600"
        />
      </label>
    </div>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("time"), value: `t = ${f(now.t)} s` },
        { label: t("x"), value: `${f(a.vx)} · ${f(now.t)} = ${f(now.x)} m` },
        { label: t("y"), value: `${f(now.y)} m` },
        { label: t("vy"), value: `${f(a.vy)} − ${f(a.gravity)}·${f(now.t)} = ${f(now.vy)} m/s` },
        { label: t("speedNow"), value: `${f(now.speed)} m/s`, emphasize: true },
        { label: t("apex"), value: `${f(a.timeUp)} s → ${f(a.maxHeight)} m`, note: t("apexNote", { vx: f(a.vx) }) },
      ]}
    />
  );
}
