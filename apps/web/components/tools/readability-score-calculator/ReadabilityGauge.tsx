"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { ReadabilityScoreCalculator } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { PASSAGE_EXAMPLES } from "./passageExamples";

const tool = new ReadabilityScoreCalculator();

const MIN = -30;
const MAX = 100;
const TICKS = [-30, 0, 30, 60, 90, 100];

const ZONES = [
  { key: "very-confusing", from: MIN, to: 30, colorClass: "stroke-red-600 dark:stroke-red-400" },
  { key: "difficult", from: 30, to: 50, colorClass: "stroke-orange-500 dark:stroke-orange-400" },
  { key: "fairly-difficult", from: 50, to: 60, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "standard", from: 60, to: 70, colorClass: "stroke-yellow-400 dark:stroke-yellow-300" },
  { key: "fairly-easy", from: 70, to: 80, colorClass: "stroke-lime-500 dark:stroke-lime-400" },
  { key: "easy", from: 80, to: 90, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "very-easy", from: 90, to: MAX, colorClass: "stroke-emerald-600 dark:stroke-emerald-400" },
];

export default function ReadabilityGauge() {
  const t = useTranslations("tools.readability-score-calculator.gauge");
  const tExamples = useTranslations("tools.readability-score-calculator.gauge.examples");
  const tBands = useTranslations("tools.readability-score-calculator.result.bands");
  const [selectedKey, setSelectedKey] = useState(PASSAGE_EXAMPLES[0].key);

  const selected = PASSAGE_EXAMPLES.find((e) => e.key === selectedKey) ?? PASSAGE_EXAMPLES[0];
  const result = tool.execute({ text: selected.text }, { locale: "en-US" }).data;
  const digitStyle = resolveDigitStyle();
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  const clampedScore = Math.max(MIN, Math.min(MAX, result.fleschReadingEase));
  const zone = ZONES.find((z) => clampedScore >= z.from && clampedScore < z.to) ?? ZONES[ZONES.length - 1];
  const bandLabel = result.readingEaseLabel ? tBands(result.readingEaseLabel) : "";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={clampedScore}
        domainMin={MIN}
        domainMax={MAX}
        zones={ZONES.map((z) => ({ key: z.key, from: z.from, to: z.to, colorClass: z.colorClass }))}
        valueLabel={fmt(result.fleschReadingEase)}
        caption={bandLabel}
        captionColorClass={zone.colorClass.replace("stroke-", "fill-")}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {PASSAGE_EXAMPLES.map((example) => (
          <button
            key={example.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === example.key}
            onClick={() => setSelectedKey(example.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === example.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tExamples(example.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tExamples(selectedKey), band: bandLabel })}</p>
    </EncyclopediaLiveWidget>
  );
}
