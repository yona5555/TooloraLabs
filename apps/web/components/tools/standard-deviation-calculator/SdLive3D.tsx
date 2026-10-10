"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useSdModel } from "./SdLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const SdScene3D = dynamic(() => import("./SdScene3D"), { ssr: false, loading: () => null });

export function preview(values: number[], f: (n: number) => string, joiner: string, max = 6): string {
  const shown = values.slice(0, max).map(f).join(joiner);
  return values.length > max ? `${shown}${joiner}…` : shown;
}

/**
 * Deep live table (data → mean → deviations → spread → position → σ bands) beside a 3D normal
 * bell built from the data's own μ and σ, with every value as a sphere and its squared deviation
 * standing as a translucent square. Reads the shared live data set, so the Result card and the
 * encyclopedia copy follow every keystroke and every drag.
 */
export default function SdLive3D({ camera = [0.4, 3.2, 8.4] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.standard-deviation-calculator.live3d");
  const tr = useTranslations("tools.standard-deviation-calculator.result");
  const tc = useTranslations("common.live3d");
  const { a, f, pct } = useSdModel();
  if (!a) return <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{tr("emptyDataset")}</p>;

  const n = a.n;
  const mu = f(a.mean, 4);
  const sq = a.points.map((p) => p.squaredDeviation);

  const groups: LiveTableGroup[] = [
    {
      title: t("groupData"),
      rows: [
        { label: tr("countLabel"), formula: `n = ${n}`, value: f(n) },
        { label: t("sum"), formula: `Σx = ${preview(a.points.map((p) => p.value), (v) => f(v), " + ")}`, value: f(a.sum, 4) },
        { label: t("min"), formula: "min(x)", value: f(a.min, 4) },
        { label: t("max"), formula: "max(x)", value: f(a.max, 4) },
        { label: t("range"), formula: `${f(a.max)} − ${f(a.min)}`, value: f(a.range, 4) },
      ],
    },
    {
      title: t("groupMean"),
      rows: [{ label: tr("meanLabel"), formula: `μ = Σx / n = ${f(a.sum, 4)} / ${n}`, value: mu, emphasize: true }],
    },
    {
      title: t("groupDeviations"),
      rows: [
        { label: t("sumDev"), formula: `Σ(x − ${mu})`, value: f(a.sumDeviations, 4) },
        { label: t("mad"), formula: `Σ|x − μ| / n = ${f(a.sumAbsDeviations)} / ${n}`, value: f(a.meanAbsDeviation, 4) },
        { label: t("farthest"), formula: `${f(a.farthest.value)} − ${mu}`, value: f(a.farthest.deviation, 4) },
        { label: t("ss"), formula: `Σ(x − μ)² = ${preview(sq, (v) => f(v), " + ", 5)}`, value: f(a.sumSquares, 4), emphasize: true },
        { label: t("shortcut"), formula: `Σx² − (Σx)²/n = ${f(a.sumOfSquaresRaw)} − ${f(a.sum)}²/${n}`, value: f(a.sumSquaresShortcut, 4) },
      ],
    },
    {
      title: t("groupSpread"),
      rows: [
        { label: tr("populationVariance"), formula: `σ² = ${f(a.sumSquares)} / ${n}`, value: f(a.populationVariance, 4) },
        { label: tr("populationStdDev"), formula: `σ = √${f(a.populationVariance)}`, value: f(a.populationStdDev, 4), emphasize: true },
        { label: tr("sampleVariance"), formula: n > 1 ? `s² = ${f(a.sumSquares)} / ${n - 1}` : t("needTwo"), value: f(a.sampleVariance, 4) },
        { label: tr("sampleStdDev"), formula: n > 1 ? `s = √${f(a.sampleVariance)}` : t("needTwo"), value: f(a.sampleStdDev, 4), emphasize: true },
        { label: t("bessel"), formula: `s / σ = √(${n} / ${Math.max(1, n - 1)})`, value: f(a.besselFactor, 4) },
        { label: t("se"), formula: `s / √n = ${f(a.sampleStdDev)} / √${n}`, value: f(a.standardError, 4) },
        { label: t("ci"), formula: `μ ± ${f(a.tCritical)} × ${f(a.standardError)}`, value: `${f(a.ciLow)} … ${f(a.ciHigh)}` },
        {
          label: t("cv"),
          formula: `σ / |μ| × 100 = ${f(a.populationStdDev)} / ${f(Math.abs(a.mean))}`,
          value: a.coefficientOfVariation === null ? t("cvUndefined") : `${f(a.coefficientOfVariation, 2)}%`,
        },
      ],
    },
    {
      title: t("groupPosition"),
      rows: [
        { label: t("zMin"), formula: `(${f(a.min)} − ${mu}) / ${f(a.populationStdDev)}`, value: f(a.zMin, 3) },
        { label: t("zMax"), formula: `(${f(a.max)} − ${mu}) / ${f(a.populationStdDev)}`, value: f(a.zMax, 3) },
      ],
    },
    {
      title: t("groupBands"),
      rows: a.bands.map((b) => ({
        label: t("band", { k: b.k }),
        formula: `[${f(b.lo)}, ${f(b.hi)}]`,
        value: `${b.inside}/${n} = ${pct(b.actualShare)} (${pct(b.normalShare)})`,
      })),
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={camera}>
          <SdScene3D a={a} fmt={(v) => f(v)} pct={pct} />
        </Scene3D>
      }
    />
  );
}
