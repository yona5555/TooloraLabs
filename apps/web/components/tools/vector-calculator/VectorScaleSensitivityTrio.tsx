"use client";
import { useTranslations } from "next-intl";
import { scaleBSensitivity } from "@tooloralabs/tools";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const FACTORS = [0.5, 1, 2];
const LABEL_KEYS = ["half", "current", "double"] as const;

/** §31 #12 Sensitivity Trio: B × 0.5 / × 1 / × 2 with A fixed — dot and cross scale, the angle never moves. */
export default function VectorScaleSensitivityTrio() {
  const t = useTranslations("tools.vector-calculator.indicators.scaleTrio");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, f, n, deg, na } = useVectorAnalysis();
  const rows = scaleBSensitivity(r.a, r.b, FACTORS);

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div className="grid w-[300px] grid-cols-3 gap-2 sm:w-[420px]">
          {rows.map((row, i) => {
            const mid = i === 1;
            return (
              <div key={row.factor} className={`rounded-xl border p-2 text-center ${mid ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/15" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"}`}>
                <p className={`text-[11px] font-bold ${mid ? "text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>{t(LABEL_KEYS[i])}</p>
                <dl dir="ltr" className="mt-1 space-y-1 font-mono text-[11px]">
                  <div><dt className="text-zinc-500 dark:text-zinc-400">A·B</dt><dd className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{n(row.dot, 2)}</dd></div>
                  <div><dt className="text-zinc-500 dark:text-zinc-400">|A×B|</dt><dd className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{n(row.crossMag, 2)}</dd></div>
                  <div><dt className="text-zinc-500 dark:text-zinc-400">θ</dt><dd className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{row.angleDeg === null ? na : `${n(row.angleDeg, 1)}°`}</dd></div>
                  <div><dt className="text-zinc-500 dark:text-zinc-400">|A+B|</dt><dd className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{n(row.magSum, 2)}</dd></div>
                </dl>
              </div>
            );
          })}
        </div>
      }
      rows={[
        ...rows.map((row) => ({ label: t("dotAt", { factor: row.factor }), value: f(row.dot) })),
        { label: tr("crossMag"), value: `${f(rows[0].crossMag)} → ${f(rows[2].crossMag)}` },
        { label: t("angleSame"), value: deg(r.angleDeg), emphasize: true },
      ]}
    />
  );
}
