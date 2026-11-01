"use client";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { viLine } from "@tooloralabs/tools";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { useOhmsModel } from "./OhmsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 230;
const L = 44;
const R = 320;
const T = 18;
const B = 190;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): V against I for your resistance R (a
 * straight line through the origin, slope R) between the lines for R/2 and 2R, with your operating
 * point highlighted. Axes run to twice your current and voltage, so the shape is the same for any
 * magnitude while every label carries the real numbers.
 */
export default function OhmsViTrend() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.vi");
  const { a, f } = useOhmsModel();
  if (!a || a.current === 0 || a.voltage === 0) return <OhmsIndicatorUnavailable title={t("title")} />;

  const I = Math.abs(a.current);
  const V = Math.abs(a.voltage);
  const Rr = Math.abs(a.resistance);
  const iMax = 2 * I;
  const vMax = 2 * V;
  const sx = (i: number) => L + (i / iMax) * (R - L);
  const sy = (v: number) => B - (Math.min(v, vMax) / vMax) * (B - T);
  const lines = [
    { k: 0.5, label: "R/2", cls: "stroke-emerald-500 dark:stroke-emerald-400", txt: "fill-emerald-600 dark:fill-emerald-400", w: 1.8 },
    { k: 1, label: `R = ${f(Rr)} Ω`, cls: "stroke-blue-600 dark:stroke-blue-400", txt: "fill-blue-700 dark:fill-blue-300", w: 3 },
    { k: 2, label: "2R", cls: "stroke-amber-500 dark:stroke-amber-400", txt: "fill-amber-600 dark:fill-amber-400", w: 1.8 },
  ];
  const end = (k: number) => {
    // Clip each line at the plot box: 2R reaches vMax at i = I, R at 2I, R/2 runs out at i = 2I.
    const iEnd = Math.min(iMax, vMax / (Rr * k));
    return { x: sx(iEnd), y: sy(iEnd * Rr * k) };
  };

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={L} y1={B} x2={R} y2={B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <line x1={L} y1={T} x2={L} y2={B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {[0, 1, 2].map((q) => (
        <text style={{ fontSize: svgPx(12) }} key={`x${q}`} x={sx(q * I)} y={B + 14} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
          {f(q * I, 3)}
        </text>
      ))}
      {[1, 2].map((q) => (
        <text style={{ fontSize: svgPx(12) }} key={`y${q}`} x={L - 5} y={sy(q * V) + 3} textAnchor="end" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
          {f(q * V, 3)}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={R} y={B + 30} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
        {t("xLabel")}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={L + 6} y={T + 4} className="fill-zinc-500 dark:fill-zinc-400">
        {t("yLabel")}
      </text>
      {lines.map((ln) => {
        const e = end(ln.k);
        const pts = viLine(Rr * ln.k, Math.min(iMax, vMax / (Rr * ln.k)));
        return (
          <g key={ln.k}>
            <line x1={sx(pts[0].current)} y1={sy(pts[0].voltage)} x2={e.x} y2={e.y} strokeWidth={ln.w} className={ln.cls} />
            <text style={{ fontSize: svgPx(ln.k === 1 ? 12 : 12) }} x={e.x - 4} y={e.y - 6} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className={ln.txt}>
              {ln.label}
            </text>
          </g>
        );
      })}
      <line x1={sx(I)} y1={sy(V)} x2={sx(I)} y2={B} strokeDasharray="3 3" className="stroke-zinc-400 dark:stroke-zinc-500" />
      <line x1={L} y1={sy(V)} x2={sx(I)} y2={sy(V)} strokeDasharray="3 3" className="stroke-zinc-400 dark:stroke-zinc-500" />
      <circle cx={sx(I)} cy={sy(V)} r={7} className="fill-red-600 dark:fill-red-400" />
      <text style={{ fontSize: svgPx(12) }} x={sx(I) + 10} y={sy(V) + 16} fontWeight={700} fontFamily="var(--font-mono)" className="fill-red-600 dark:fill-red-400">
        {`(${f(I, 3)} A, ${f(V, 3)} V)`}
      </text>
    </svg>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={0} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        { label: t("slope"), value: `ΔV / ΔI = ${f(V)} / ${f(I)} = ${f(Rr)} Ω`, emphasize: true },
        { label: t("atDouble"), value: `${f(2 * I)} A × ${f(Rr)} Ω = ${f(2 * V)} V` },
        { label: "R/2", value: `${f(I)} A → ${f(V / 2)} V` },
        { label: "2R", value: `${f(I)} A → ${f(2 * V)} V` },
        { label: t("conductance"), value: `1 / ${f(Rr)} = ${f(a.conductance)} S` },
      ]}
    />
  );
}
