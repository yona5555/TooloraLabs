"use client";
import { useTranslations } from "next-intl";
import { rankDensity } from "@tooloralabs/tools";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";

const W = 340;
const ROW = 19;
const TOP = 22;
const LABEL = 92;
const BAR_X = LABEL + 6;
const BAR_W = 180;
const LO = -3.5;

/**
 * Type #5 (Ranked Horizontal Bar List): your density slotted among twelve real materials, densest
 * first, on a log axis (air at 0.0012 to osmium at 22.59 g/cm³), with water's line marked.
 */
export default function DensityMaterialRanking() {
  const t = useTranslations("tools.density-calculator.education.lab.ranking");
  const tm = useTranslations("tools.density-calculator.education.lab.ranking.materials");
  const { a, f } = useDensityModel();
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const ranked = rankDensity(a.density);
  const hi = Math.max(Math.log10(30), Math.log10(a.density) + 0.1);
  const lo = Math.min(LO, Math.log10(a.density) - 0.1);
  const len = (d: number) => Math.max(2, ((Math.log10(d) - lo) / (hi - lo)) * BAR_W);
  const H = TOP + ranked.length * ROW + 6;
  const xWater = BAR_X + len(1);
  const idx = ranked.findIndex((r) => r.yours);
  const above = ranked[idx - 1];
  const below = ranked[idx + 1];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={BAR_X} y={12} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
      <line x1={xWater} y1={TOP - 4} x2={xWater} y2={H - 4} strokeDasharray="4 3" className="stroke-sky-500 dark:stroke-sky-400" />
      {ranked.map((r, i) => {
        const y = TOP + i * ROW;
        const l = len(r.density);
        return (
          <g key={r.key}>
            <text x={LABEL} y={y + 12} textAnchor="end" fontSize={11} fontWeight={r.yours ? 700 : 500} className={r.yours ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}>
              {r.yours ? t("yours") : tm(r.key)}
            </text>
            <rect x={BAR_X} y={y + 3} width={l} height={ROW - 6} rx={3} className={r.yours ? "fill-blue-600 dark:fill-blue-400" : r.density < 1 ? "fill-sky-300 dark:fill-sky-700" : "fill-zinc-300 dark:fill-zinc-600"} />
            <text x={BAR_X + l + 4} y={y + 12} fontSize={10} fontWeight={r.yours ? 700 : 400} fontFamily="ui-monospace, monospace" className={r.yours ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-500 dark:fill-zinc-400"}>
              {f(r.density)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("rank"), value: `${idx + 1} / ${ranked.length}`, emphasize: true },
        ...(above ? [{ label: tm(above.key), value: `${f(above.density)} g/cm³ (× ${f(above.density / a.density, 3)})` }] : []),
        ...(below ? [{ label: tm(below.key), value: `${f(below.density)} g/cm³ (× ${f(below.density / a.density, 3)})` }] : []),
        { label: t("vsWater"), value: `${f(a.density)} / 1 = ${f(a.specificGravity)}` },
        { label: t("vsOsmium"), value: `${f(a.density)} / 22.59 = ${f(a.density / 22.59, 3)}` },
      ]}
    />
  );
}
