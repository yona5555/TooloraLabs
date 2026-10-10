"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useMmmModel } from "./MmmLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const MmmScene3D = dynamic(() => import("./MmmScene3D"), { ssr: false, loading: () => null });

function preview(values: number[], f: (n: number) => string, joiner: string, max = 8): string {
  const shown = values.slice(0, max).map(f).join(joiner);
  return values.length > max ? `${shown}${joiner}…` : shown;
}

export function shapeKey(skew: number): "symmetric" | "right" | "left" {
  if (Math.abs(skew) < 0.2) return "symmetric";
  return skew > 0 ? "right" : "left";
}

/**
 * Deep live table (data → centre → spread → shape) beside 3D dot stacks on a number line that
 * balances on the mean. Reads the shared live data set, so it follows every keystroke and every
 * drag, in the Result card and in the encyclopedia alike.
 */
export default function MmmLive3D({ camera = [0.4, 3.2, 8.4] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.mean-median-mode-range-calculator.live3d");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const tc = useTranslations("common.live3d");
  const { a, f } = useMmmModel();
  if (!a) return <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{tr("emptyDataset")}</p>;

  const n = a.n;
  const medianFormula =
    a.medianPositions.length === 2
      ? `(x${a.medianPositions[0]} + x${a.medianPositions[1]}) / 2 = (${f(a.sorted[a.medianPositions[0] - 1])} + ${f(a.sorted[a.medianPositions[1] - 1])}) / 2`
      : `x${a.medianPositions[0]} = ${f(a.sorted[a.medianPositions[0] - 1])}`;
  const modeText = a.modes.length ? a.modes.map((m) => f(m)).join(", ") : tr("noMode");

  const groups: LiveTableGroup[] = [
    {
      title: t("groupData"),
      rows: [
        { label: tr("count"), formula: `n = ${n}`, value: f(n) },
        { label: t("sorted"), formula: preview(a.sorted, (v) => f(v), " ≤ "), value: `${f(a.sorted[0])} … ${f(a.sorted[n - 1])}` },
        { label: tr("sum"), formula: `Σx = ${preview(a.sorted, (v) => f(v), " + ")}`, value: f(a.sum) },
        { label: tr("min"), formula: "x1", value: f(a.min) },
        { label: tr("max"), formula: `x${n}`, value: f(a.max) },
      ],
    },
    {
      title: t("groupCentre"),
      rows: [
        { label: tr("mean"), formula: `x̄ = Σx / n = ${f(a.sum)} / ${n}`, value: f(a.mean, 4), emphasize: true },
        { label: t("medianPosition"), formula: `(n + 1) / 2 = (${n} + 1) / 2`, value: f(a.medianRank) },
        { label: tr("median"), formula: medianFormula, value: f(a.median, 4), emphasize: true },
        { label: tr("mode"), formula: a.modes.length ? `f = ${a.maxFrequency} / ${n}` : `f(max) = 1`, value: modeText, emphasize: true },
        { label: t("distinct"), formula: `${a.frequencies.length} / ${n}`, value: f(a.frequencies.length) },
        { label: t("midrange"), formula: `(${f(a.min)} + ${f(a.max)}) / 2`, value: f(a.midrange) },
      ],
    },
    {
      title: t("groupSpread"),
      rows: [
        { label: tr("range"), formula: `${f(a.max)} − ${f(a.min)}`, value: f(a.range), emphasize: true },
        { label: "Q1", formula: t("q1Formula"), value: f(a.q1) },
        { label: "Q3", formula: t("q3Formula"), value: f(a.q3) },
        { label: "IQR", formula: `${f(a.q3)} − ${f(a.q1)}`, value: f(a.iqr) },
        { label: t("sumDev"), formula: `Σ(x − ${f(a.mean)})`, value: f(a.sumDeviations) },
        { label: t("mad"), formula: `Σ|x − x̄| / n = ${f(a.sumAbsDevMean)} / ${n}`, value: f(a.meanAbsDeviation) },
        { label: t("popSd"), formula: `√(${f(a.sumSquares)} / ${n})`, value: f(a.populationStdDev) },
        { label: t("sampleSd"), formula: n > 1 ? `√(${f(a.sumSquares)} / ${n - 1})` : "n = 1", value: f(a.sampleStdDev) },
      ],
    },
    {
      title: t("groupShape"),
      rows: [
        { label: t("lowerFence"), formula: `Q1 − 1.5 × IQR`, value: f(a.lowerFence) },
        { label: t("upperFence"), formula: `Q3 + 1.5 × IQR`, value: f(a.upperFence) },
        { label: t("outliers"), formula: `x < ${f(a.lowerFence)} ∨ x > ${f(a.upperFence)}`, value: a.outliers.length ? a.outliers.map((v) => f(v)).join(", ") : t("none") },
        { label: t("skew"), formula: `3(${f(a.mean)} − ${f(a.median)}) / ${f(a.sampleStdDev)}`, value: f(a.pearsonSkew) },
        { label: t("shape"), formula: `x̄ − ${tr("median")} = ${f(a.mean - a.median)}`, value: t(`shapes.${shapeKey(a.pearsonSkew)}`), emphasize: true },
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
          <MmmScene3D
            a={a}
            fmt={(v) => f(v)}
            labels={{ mean: tr("mean"), median: tr("median"), mode: tr("mode"), range: tr("range"), iqr: "IQR", frequency: t("frequency") }}
          />
        </Scene3D>
      }
    />
  );
}
