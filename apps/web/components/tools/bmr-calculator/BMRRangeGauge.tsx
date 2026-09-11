"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BMRCalculator as BMRTool } from "@tooloralabs/tools";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { BMR_SCENARIOS, bandForBmr } from "./types";

const tool = new BMRTool();

const MIN_BMR = 1000;
const MAX_BMR = 2500;
const TICKS = [1000, 1400, 2000, 2500];

export default function BMRRangeGauge() {
  const t = useTranslations("tools.bmr-calculator.education.intro.bmrGauge");
  const tScenarios = useTranslations("tools.bmr-calculator.scenarios");
  const tRange = useTranslations("tools.bmr-calculator.result.range");
  const [selectedKey, setSelectedKey] = useState("average");

  const values = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of BMR_SCENARIOS) {
      const output = tool.execute(
        { gender: s.gender, weightKg: Number(s.weightKg), heightCm: Number(s.heightCm), age: Number(s.age), formula: "mifflinStJeor" },
        { locale: "en-US" }
      );
      map.set(s.key, output.data.mifflinStJeor ?? 0);
    }
    return map;
  }, []);

  const bmr = values.get(selectedKey) ?? 0;
  const band = bandForBmr(bmr);
  const digitStyle = resolveDigitStyle(String(Math.round(bmr)));
  const fmt = (value: number) => formatLocalizedNumber(Math.round(value), digitStyle);

  const classification = tRange(band);
  const classificationColor =
    band === "lower" ? "fill-blue-600 dark:fill-blue-400" : band === "typical" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={bmr}
        domainMin={MIN_BMR}
        domainMax={MAX_BMR}
        zones={[
          { key: "lower", from: MIN_BMR, to: 1400, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "typical", from: 1400, to: 2000, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "higher", from: 2000, to: MAX_BMR, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={fmt(bmr)}
        caption={classification}
        captionColorClass={classificationColor}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {BMR_SCENARIOS.map((s) => (
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("kcalFact", { kcal: fmt(bmr) })}</p>
    </EncyclopediaLiveWidget>
  );
}
