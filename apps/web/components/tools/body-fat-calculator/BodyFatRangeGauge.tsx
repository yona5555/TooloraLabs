"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BodyFatCalculator as BodyFatTool } from "@tooloralabs/tools";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { BODY_FAT_SCENARIOS } from "./types";

const tool = new BodyFatTool();

const MIN_BF = 0;
const MAX_BF = 40;
// Zone boundaries follow the U.S. Navy method's male thresholds, used here as
// a single shared visual reference scale (the tool itself still classifies
// each example correctly against its own gender-specific thresholds).
const TICKS = [0, 5, 13, 17, 24, 40];

export default function BodyFatRangeGauge() {
  const t = useTranslations("tools.body-fat-calculator.education.intro.bodyFatGauge");
  const tScenarios = useTranslations("tools.body-fat-calculator.scenarios");
  const tCategories = useTranslations("tools.body-fat-calculator.categories");
  const [selectedKey, setSelectedKey] = useState("averageMale");

  const values = useMemo(() => {
    const map = new Map<string, { percent: number; category: string }>();
    for (const s of BODY_FAT_SCENARIOS) {
      const output = tool.execute(
        { gender: s.gender, heightCm: Number(s.heightCm), neckCm: Number(s.neckCm), waistCm: Number(s.waistCm), hipCm: s.gender === "female" ? Number(s.hipCm) : undefined },
        { locale: "en-US" }
      );
      map.set(s.key, { percent: output.data.bodyFatPercent, category: output.data.category ?? "average" });
    }
    return map;
  }, []);

  const selected = values.get(selectedKey) ?? { percent: 0, category: "average" };
  const digitStyle = resolveDigitStyle(String(selected.percent));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  const classification = tCategories(selected.category);
  const categoryColor: Record<string, string> = {
    essential: "fill-blue-600 dark:fill-blue-400",
    athletes: "fill-green-600 dark:fill-green-400",
    fitness: "fill-teal-600 dark:fill-teal-400",
    average: "fill-amber-600 dark:fill-amber-400",
    obese: "fill-red-600 dark:fill-red-400",
  };

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={selected.percent}
        domainMin={MIN_BF}
        domainMax={MAX_BF}
        zones={[
          { key: "essential", from: 0, to: 5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "athletes", from: 5, to: 13, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "fitness", from: 13, to: 17, colorClass: "stroke-teal-500 dark:stroke-teal-400" },
          { key: "average", from: 17, to: 24, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
          { key: "obese", from: 24, to: MAX_BF, colorClass: "stroke-red-500 dark:stroke-red-400" },
        ]}
        valueLabel={`${fmt(selected.percent)}%`}
        caption={classification}
        captionColorClass={categoryColor[selected.category] ?? categoryColor.average}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {BODY_FAT_SCENARIOS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === s.key}
            onClick={() => setSelectedKey(s.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === s.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tScenarios(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tScenarios(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("percentFact", { percent: fmt(selected.percent) })}</p>
    </EncyclopediaLiveWidget>
  );
}
