"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = 0;
const MAX_LOG = 2;
const TICKS = [0, 1, 2];

// Real reactions and the sum of their smallest whole-number balanced
// coefficients (e.g. 2H2 + O2 -> 2H2O sums to 2 + 1 + 2 = 5).
const GAUGE_REACTIONS: { key: string; sum: number }[] = [
  { key: "hydrogenWater", sum: 5 },
  { key: "ammoniaSynthesis", sum: 6 },
  { key: "ironRusting", sum: 9 },
  { key: "glucoseCombustion", sum: 19 },
  { key: "sucroseCombustion", sum: 36 },
  { key: "octaneCombustion", sum: 61 },
];

export default function BalancerComplexityGauge() {
  const t = useTranslations("tools.chemical-equation-balancer.education.intro.complexityGauge");
  const tReactions = useTranslations("tools.chemical-equation-balancer.education.intro.complexityGauge.reactions");
  const tEquations = useTranslations("tools.chemical-equation-balancer.education.intro.complexityGauge.equations");
  const [selectedKey, setSelectedKey] = useState("glucoseCombustion");

  const selected = GAUGE_REACTIONS.find((r) => r.key === selectedKey) ?? GAUGE_REACTIONS[0];
  const sum = selected.sum;
  const classification: "simple" | "moderate" | "complex" = sum < 10 ? "simple" : sum < 50 ? "moderate" : "complex";

  const gaugeValue = Math.log10(sum);

  const classificationColor =
    classification === "simple" ? "fill-blue-600 dark:fill-blue-400" : classification === "moderate" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "simple", from: MIN_LOG, to: 1, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "moderate", from: 1, to: 1.7, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "complex", from: 1.7, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`Σ = ${sum}`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === r.key}
            onClick={() => setSelectedKey(r.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === r.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tReactions(r.key)}
          </button>
        ))}
      </div>

      <p dir="ltr" className="mt-3 text-center font-mono text-sm opacity-90">
        {tEquations(selectedKey)}
      </p>
      <p className="mt-3 text-center text-sm leading-6">{t("verdict", { reaction: tReactions(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("sumFact", { sum })}</p>
    </EncyclopediaLiveWidget>
  );
}
