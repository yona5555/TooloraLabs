"use client";
import { useTranslations } from "next-intl";
import MmmIndicatorCard, { scaleX } from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

const W = 360;
const H = 150;
const Y = 70;

/**
 * Type #19 (Zone Strip): the range split into colored zones — lower tail, middle 50% (IQR) and
 * upper tail — with Tukey's 1.5 × IQR fences, so a single extreme value visibly inflates the range.
 */
export default function MmmRangeZoneStrip() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.rangeZone");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const tl = useTranslations("tools.mean-median-mode-range-calculator.live3d");
  const { a, f } = useMmmModel();
  if (!a) return null;

  const lo = Math.min(a.min, a.lowerFence);
  const hi = Math.max(a.max, a.upperFence);
  const sx = scaleX(lo, hi, 16, W - 16);
  const outSet = new Set(a.outliers);
  const seen = new Map<number, number>();
  const zones = [
    { from: a.min, to: a.q1, cls: "fill-amber-300/80 dark:fill-amber-500/50" },
    { from: a.q1, to: a.q3, cls: "fill-emerald-400/80 dark:fill-emerald-500/60" },
    { from: a.q3, to: a.max, cls: "fill-amber-300/80 dark:fill-amber-500/50" },
  ];
  const share = a.range > 0 ? (a.iqr / a.range) * 100 : 100;

  const strip = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <rect x={16} y={Y} width={W - 32} height={16} rx={8} className="fill-zinc-100 dark:fill-zinc-800" />
      {zones.map((z, i) => (
        <rect key={i} x={sx(z.from)} y={Y} width={Math.max(0, sx(z.to) - sx(z.from))} height={16} className={z.cls} />
      ))}
      {[a.lowerFence, a.upperFence].map((v, i) => (
        <g key={i}>
          <line x1={sx(v)} x2={sx(v)} y1={Y - 10} y2={Y + 26} strokeDasharray="3 2" strokeWidth={1.5} className="stroke-rose-500 dark:stroke-rose-400" />
          <text x={sx(v)} y={Y + 40} textAnchor={i === 0 ? "start" : "end"} fontSize={10} className="fill-rose-600 dark:fill-rose-400">
            {`${i === 0 ? tl("lowerFence") : tl("upperFence")} ${f(v)}`}
          </text>
        </g>
      ))}
      {a.sorted.map((v, i) => {
        const k = seen.get(v) ?? 0;
        seen.set(v, k + 1);
        return <circle key={i} cx={sx(v)} cy={Y - 8 - k * 9} r={4} className={outSet.has(v) ? "fill-rose-600 dark:fill-rose-400" : "fill-blue-600 dark:fill-blue-400"} />;
      })}
      {[
        { v: a.min, l: tr("min") },
        { v: a.q1, l: "Q1" },
        { v: a.q3, l: "Q3" },
        { v: a.max, l: tr("max") },
      ].map((m, i) => (
        <text key={i} x={sx(m.v)} y={Y + 58 + (i % 2) * 12} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
          {`${m.l} ${f(m.v)}`}
        </text>
      ))}
      <text x={W / 2} y={14} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
        {`IQR ${f(a.iqr)} · ${tr("range")} ${f(a.range)}`}
      </text>
    </svg>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={strip}
      rows={[
        { label: tr("range"), value: `${f(a.max)} − ${f(a.min)} = ${f(a.range)}` },
        { label: "IQR", value: `${f(a.q3)} − ${f(a.q1)} = ${f(a.iqr)}` },
        { label: t("iqrShare"), value: `${f(share, 1)}%` },
        { label: t("fences"), value: `[${f(a.lowerFence)}, ${f(a.upperFence)}]` },
        { label: tl("outliers"), value: a.outliers.length ? a.outliers.map((v) => f(v)).join(", ") : tl("none"), emphasize: true },
      ]}
    />
  );
}
