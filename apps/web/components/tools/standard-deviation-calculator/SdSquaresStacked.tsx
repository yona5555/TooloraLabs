"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 300;
const BAR_Y = 8;
const BAR_H = 40;
const COLORS = [
  "fill-blue-500 dark:fill-blue-400",
  "fill-violet-500 dark:fill-violet-400",
  "fill-emerald-500 dark:fill-emerald-400",
  "fill-amber-500 dark:fill-amber-400",
  "fill-rose-500 dark:fill-rose-400",
  "fill-cyan-500 dark:fill-cyan-400",
  "fill-lime-500 dark:fill-lime-400",
  "fill-fuchsia-500 dark:fill-fuchsia-400",
];

/** Type #15 (Stacked Segmented Bar): the sum of squares split into each value's squared deviation, largest first, with a ranked legend. */
export default function SdSquaresStacked() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.squares");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, f, pct } = useSdModel();
  if (!a) return null;

  const parts = [...a.points].sort((p, q) => q.squaredDeviation - p.squaredDeviation);
  const legend = parts.slice(0, 6);
  const H = BAR_Y + BAR_H + 12 + legend.length * 20;
  let x = 0;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <rect x={0} y={BAR_Y} width={W} height={BAR_H} rx={8} className="fill-zinc-100 dark:fill-zinc-800" />
      {a.sumSquares > 0 &&
        parts.map((p, i) => {
          const w = p.shareOfSS * W;
          const seg = (
            <g key={p.index}>
              <rect x={x} y={BAR_Y} width={Math.max(0, w - 1)} height={BAR_H} className={COLORS[i % COLORS.length]} />
              {w > 34 && (
                <text x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-white">
                  {pct(p.shareOfSS)}
                </text>
              )}
            </g>
          );
          x += w;
          return seg;
        })}
      {legend.map((p, i) => {
        const y = BAR_Y + BAR_H + 14 + i * 20;
        return (
          <g key={p.index}>
            <rect x={0} y={y} width={12} height={12} rx={3} className={COLORS[i % COLORS.length]} />
            <text x={18} y={y + 10} fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {`x = ${f(p.value)}  (${f(p.deviation)})² = ${f(p.squaredDeviation)}`}
            </text>
            <text x={W} y={y + 10} textAnchor="end" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
              {pct(p.shareOfSS)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const top2 = parts.slice(0, 2).reduce((s, p) => s + p.shareOfSS, 0);

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: tl("ss"), value: f(a.sumSquares, 4) },
        { label: t("largest"), value: `${f(parts[0].squaredDeviation)} / ${f(a.sumSquares)}`, note: pct(parts[0].shareOfSS) },
        { label: t("topTwo"), value: pct(top2) },
        { label: t("equalShare"), value: pct(1 / a.n) },
        { label: t("values"), value: String(a.n), emphasize: true },
      ]}
    />
  );
}
