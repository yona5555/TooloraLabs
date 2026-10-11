"use client";
import { useTranslations } from "next-intl";
import { sampleTrajectory } from "@tooloralabs/tools";
import PmIndicatorCard from "./PmIndicatorCard";
import { r2, usePmModel } from "./PmLiveContext";

const W = 400;
const H = 230;
const L = 12;
const R = 388;
const T = 22;
const B = 186;
const STEPS = 8;

/**
 * Type #1 (Labeled Bar Chart): the height y(t) at nine equal instants from launch to impact,
 * each bar labelled with its height. Equal Δt gives equal Δx, while the height gains shrink
 * towards the apex and the losses grow after it — the parabola read as bars.
 */
export default function PmHeightBars() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.bars");
  const { a, f } = usePmModel();
  if (!a) return null;

  const pts = sampleTrajectory(a, STEPS);
  const top = Math.max(a.maxHeight, 1e-9);
  const slot = (R - L) / pts.length;
  const bw = slot * 0.62;
  const py = (y: number) => r2(B - (y / top) * (B - T));
  const dt = a.timeOfFlight / STEPS;
  const highest = pts.reduce((b, q) => (q.y > b.y ? q : b), pts[0]);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      <line x1={L} y1={B} x2={R} y2={B} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
      {pts.map((q, i) => {
        const x = r2(L + slot * i + (slot - bw) / 2);
        const y = py(q.y);
        const peak = q === highest;
        return (
          <g key={i}>
            <rect x={x} y={y} width={r2(bw)} height={r2(Math.max(0, B - y))} rx={3} className={peak ? "fill-amber-500 dark:fill-amber-400" : i === 0 ? "fill-sky-500 dark:fill-sky-400" : "fill-blue-600 dark:fill-blue-400"} />
            <text x={r2(x + bw / 2)} y={r2(y - 5)} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">{f(q.y, 1)}</text>
            <text x={r2(x + bw / 2)} y={B + 14} textAnchor="middle" fontSize={9.5} className="fill-zinc-500 dark:fill-zinc-400">{f(q.t, 2)}</text>
          </g>
        );
      })}
      <text x={R} y={B + 32} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">t (s)</text>
      <text x={L} y={B + 32} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">y (m)</text>
    </svg>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("step"), value: `Δt = ${f(a.timeOfFlight)} / ${STEPS} = ${f(dt, 3)} s` },
        { label: t("dx"), value: `Δx = ${f(a.vx)} × ${f(dt, 3)} = ${f(a.vx * dt)} m` },
        { label: t("first"), value: `${f(pts[0].y)} → ${f(pts[1].y)} m (Δ ${f(pts[1].y - pts[0].y)})` },
        { label: t("highest"), value: `y(${f(highest.t)} s) = ${f(highest.y)} m` },
        { label: t("peak"), value: `h_max = ${f(a.maxHeight)} m`, emphasize: true },
      ]}
    />
  );
}
