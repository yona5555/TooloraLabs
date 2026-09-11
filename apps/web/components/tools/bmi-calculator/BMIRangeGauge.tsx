"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_BMI = 10;
const MAX_BMI = 45;
const TICKS = [10, 18.5, 25, 30, 45];
const REFERENCE_HEIGHT_M = 1.7;

// Real, documented approximate BMI ranges for archetypal examples — the
// bodybuilder and lineman are classic illustrations of BMI's blind spot for
// muscle mass, not literal individuals.
const GAUGE_EXAMPLES: { key: string; bmi: number; levelKey: "warning" | "normal" | "high" | "critical" }[] = [
  { key: "competitiveMarathoner", bmi: 19, levelKey: "warning" },
  { key: "averageAdult", bmi: 26.5, levelKey: "high" },
  { key: "recreationalBodybuilder", bmi: 29, levelKey: "high" },
  { key: "professionalLineman", bmi: 36, levelKey: "critical" },
];

export default function BMIRangeGauge() {
  const t = useTranslations("tools.bmi-calculator.education.intro.bmiGauge");
  const tExamples = useTranslations("tools.bmi-calculator.education.intro.bmiGauge.examples");
  const tLevels = useTranslations("tools.bmi-calculator.levels");
  const [selectedKey, setSelectedKey] = useState("averageAdult");

  const selected = GAUGE_EXAMPLES.find((e) => e.key === selectedKey) ?? GAUGE_EXAMPLES[0];
  const { bmi, levelKey } = selected;
  const digitStyle = resolveDigitStyle(String(bmi));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  const weight = bmi * REFERENCE_HEIGHT_M ** 2;
  const classification = tLevels(`${levelKey}.title`);

  const classificationColor =
    levelKey === "warning"
      ? "fill-blue-600 dark:fill-blue-400"
      : levelKey === "normal"
        ? "fill-green-600 dark:fill-green-400"
        : levelKey === "high"
          ? "fill-amber-600 dark:fill-amber-400"
          : "fill-red-600 dark:fill-red-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={bmi}
        domainMin={MIN_BMI}
        domainMax={MAX_BMI}
        zones={[
          { key: "warning", from: MIN_BMI, to: 18.5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "normal", from: 18.5, to: 25, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "high", from: 25, to: 30, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
          { key: "critical", from: 30, to: MAX_BMI, colorClass: "stroke-red-500 dark:stroke-red-400" },
        ]}
        valueLabel={fmt(bmi)}
        caption={classification}
        captionColorClass={classificationColor}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_EXAMPLES.map((e) => (
          <button
            key={e.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === e.key}
            onClick={() => setSelectedKey(e.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === e.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tExamples(e.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tExamples(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("weightFact", { weight: fmt(weight) })}</p>
    </EncyclopediaLiveWidget>
  );
}
