"use client";
import { useTranslations } from "next-intl";
import { DENSITY_WATER } from "@tooloralabs/tools";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

import FitSvg from "@/components/tool-ui/FitSvg";
const W = 320;
const H = 210;
const BASE = 160;
const TOP = 48;
const BAR = 60;
const CLS = ["fill-emerald-500 dark:fill-emerald-400", "fill-blue-600 dark:fill-blue-400", "fill-amber-500 dark:fill-amber-400"];

/** Type #12 (Sensitivity Trio): the same mass squeezed into half the volume, the current volume and double the volume → ρ = m / V, with water's 1 g/cm³ marked. */
export default function DensityVolumeTrio() {
  const t = useTranslations("tools.density-calculator.education.lab.trio");
  const { a, f } = useDensityModel();
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const items = a.volumeSensitivity;
  const maxD = Math.max(...items.map((i) => i.density), 1e-30);
  const names = [t("half"), t("current"), t("double")];
  const yWater = BASE - (DENSITY_WATER / maxD) * (BASE - TOP);
  const showWater = DENSITY_WATER <= maxD * 1.05 && DENSITY_WATER >= maxD * 0.02;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {items.map((it, i) => {
        const cx = (W / 3) * i + W / 6;
        const h = (it.density / maxD) * (BASE - TOP);
        return (
          <g key={it.factor}>
            <rect x={cx - BAR / 2} y={BASE - h} width={BAR} height={Math.max(1, h)} rx={6} className={CLS[i]} />
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE - h - 8} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(it.density, 3)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 16} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {names[i]}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 31} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(it.volume)} cm³`}
            </text>
          </g>
        );
      })}
      {showWater && (
        <g>
          <line x1={0} y1={yWater} x2={W} y2={yWater} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-sky-500 dark:stroke-sky-400" />
          <text style={{ fontSize: svgPx(12) }} x={W - 2} y={yWater - 4} textAnchor="end" fontWeight={600} className="fill-sky-600 dark:fill-sky-400">
            {t("water")}
          </text>
        </g>
      )}
      <text style={{ fontSize: svgPx(12) }} x={4} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {`ρ (g/cm³) · m = ${f(a.mass)} g`}
      </text>
    </FitSvg>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("half"), value: `${f(a.mass)} / ${f(items[0].volume)} = ${f(items[0].density)} g/cm³` },
        { label: t("current"), value: `${f(a.mass)} / ${f(items[1].volume)} = ${f(items[1].density)} g/cm³`, emphasize: true },
        { label: t("double"), value: `${f(a.mass)} / ${f(items[2].volume)} = ${f(items[2].density)} g/cm³` },
        { label: t("ratio"), value: `${f(items[0].density / (items[2].density || 1))} : 1`, note: t("ratioNote") },
      ]}
    />
  );
}
