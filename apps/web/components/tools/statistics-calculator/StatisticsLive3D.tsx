"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { StatisticsCalculator, buildHistogram, computeQuartiles } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useStatisticsLive } from "./StatisticsLiveContext";
import { parseDataSet } from "./types";

const StatisticsScene3D = dynamic(() => import("./StatisticsScene3D"), { ssr: false, loading: () => null });

const tool = new StatisticsCalculator();

function listPreview(values: number[], f: (n: number) => string, joiner: string): string {
  const shown = values.slice(0, 5).map(f).join(joiner);
  return values.length > 5 ? `${shown}${joiner}…` : shown;
}

/**
 * Statistics live table + 3D histogram (site rule: table left, 3D right).
 * Reads the shared live data set, so it follows the input on every keystroke
 * both in the Result card and in the encyclopedia.
 */
export default function StatisticsLive3D({ camera = [0.6, 3.4, 8.6] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.statistics-calculator.live3d");
  const tr = useTranslations("tools.statistics-calculator.result");
  const tc = useTranslations("common.live3d");
  const { dims } = useStatisticsLive();
  const values = useMemo(() => parseDataSet(dims.rawData), [dims.rawData]);
  const digitStyle = resolveDigitStyle(dims.rawData);
  const fmt = (n: number) => formatLocalizedNumber(n, digitStyle, { maximumFractionDigits: 4 });

  const model = useMemo(() => {
    const stats = tool.execute({ values }, { locale: "en-US" }).data;
    return { stats, hist: buildHistogram(values), quart: computeQuartiles(values), sorted: [...values].sort((a, b) => a - b) };
  }, [values]);

  const { stats, hist, quart, sorted } = model;
  if (stats.error) return <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{tr("emptyDataset")}</p>;

  const n = stats.count;
  const ss = stats.populationVariance * n;
  const cv = stats.mean !== 0 ? (stats.sampleStdDev / Math.abs(stats.mean)) * 100 : 0;
  const mid = Math.floor(n / 2);
  const medianFormula = n % 2 === 0 ? `(x${mid} + x${mid + 1}) / 2 = (${fmt(sorted[mid - 1])} + ${fmt(sorted[mid])}) / 2` : `x${mid + 1} = ${fmt(sorted[mid])}`;
  const freq = stats.mode.length > 0 ? values.filter((v) => v === stats.mode[0]).length : 1;

  const groups: LiveTableGroup[] = [
    {
      title: t("groupData"),
      rows: [
        { label: tr("count"), formula: `n = ${n}`, value: fmt(n) },
        { label: tr("sum"), formula: `Σx = ${listPreview(values, fmt, " + ")}`, value: fmt(stats.sum) },
        { label: tr("min"), formula: `min = x1`, value: fmt(stats.min) },
        { label: tr("max"), formula: `max = x${n}`, value: fmt(stats.max) },
      ],
    },
    {
      title: t("groupCentre"),
      rows: [
        { label: tr("mean"), formula: `x̄ = Σx / n = ${fmt(stats.sum)} / ${n}`, value: fmt(stats.mean), emphasize: true },
        { label: tr("median"), formula: medianFormula, value: fmt(stats.median), emphasize: true },
        { label: tr("mode"), formula: stats.mode.length > 0 ? `f = ${freq}` : "f = 1", value: stats.mode.length > 0 ? stats.mode.map(fmt).join(", ") : tr("noMode") },
      ],
    },
    {
      title: t("groupSpread"),
      rows: [
        { label: tr("range"), formula: `max − min = ${fmt(stats.max)} − ${fmt(stats.min)}`, value: fmt(stats.range) },
        { label: t("q1"), formula: `Q1 = median(lower half)`, value: fmt(quart.q1) },
        { label: t("q3"), formula: `Q3 = median(upper half)`, value: fmt(quart.q3) },
        { label: t("iqr"), formula: `Q3 − Q1 = ${fmt(quart.q3)} − ${fmt(quart.q1)}`, value: fmt(quart.iqr) },
        { label: t("ssd"), formula: `Σ(x − ${fmt(stats.mean)})²`, value: fmt(ss) },
        { label: tr("populationVariance"), formula: `σ² = ${fmt(ss)} / ${n}`, value: fmt(stats.populationVariance) },
        { label: tr("sampleVariance"), formula: n > 1 ? `s² = ${fmt(ss)} / ${n - 1}` : "s² = 0", value: fmt(stats.sampleVariance) },
        { label: tr("populationStdDev"), formula: `σ = √${fmt(stats.populationVariance)}`, value: fmt(stats.populationStdDev) },
        { label: tr("sampleStdDev"), formula: `s = √${fmt(stats.sampleVariance)}`, value: fmt(stats.sampleStdDev), emphasize: true },
        { label: t("cv"), formula: `s / x̄ × 100 = ${fmt(stats.sampleStdDev)} / ${fmt(Math.abs(stats.mean))} × 100`, value: fmt(cv), unit: "%" },
      ],
    },
    {
      title: t("groupHistogram"),
      rows: [
        { label: t("binCount"), formula: `⌈log₂ ${n}⌉ + 1 = ${hist.sturges}`, value: fmt(hist.binCount) },
        { label: t("binWidth"), formula: `(${fmt(stats.max)} − ${fmt(stats.min)}) / ${hist.binCount}`, value: fmt(hist.binWidth) },
        ...hist.bins.map((b, i) => ({
          label: `${t("bin")} ${i + 1}`,
          formula: `[${fmt(b.start)}, ${fmt(b.end)}${i === hist.bins.length - 1 ? "]" : ")"} · ${fmt(Math.round(b.relative * 1000) / 10)}%`,
          value: fmt(b.count),
          emphasize: b.count === hist.maxCount,
        })),
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={camera}>
          <StatisticsScene3D
            bins={hist.bins}
            maxCount={hist.maxCount}
            mean={stats.mean}
            median={stats.median}
            meanLabel={tr("mean")}
            medianLabel={tr("median")}
            countLabel={t("countAxis")}
            fmt={fmt}
          />
        </Scene3D>
      }
    />
  );
}
