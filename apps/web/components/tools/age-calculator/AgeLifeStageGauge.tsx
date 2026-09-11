"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AgeCalculator as AgeTool, getLifeStage, type LifeStage } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { AGE_SCENARIOS } from "./types";

const tool = new AgeTool();

// A fixed reference date, not the live clock — keeps this widget's numbers
// stable between server and client render (the same hydration-safety
// concern the live-ticking age display elsewhere on this page works around).
const REFERENCE_DATE = "2026-01-01";

const MIN_AGE = 0;
const MAX_AGE = 100;
const TICKS = [0, 10, 20, 40, 60, 100];

const STAGE_COLOR: Record<LifeStage, string> = {
  childhood: "fill-blue-400 dark:fill-blue-300",
  adolescence: "fill-blue-500 dark:fill-blue-400",
  youth: "fill-blue-600 dark:fill-blue-500",
  middleAge: "fill-indigo-600 dark:fill-indigo-400",
  oldAge: "fill-indigo-800 dark:fill-indigo-300",
};

export default function AgeLifeStageGauge() {
  const t = useTranslations("tools.age-calculator.education.intro.lifeStageGauge");
  const tScenarios = useTranslations("tools.age-calculator.scenarios");
  const tStages = useTranslations("tools.age-calculator.aboveFold.lifeStages");
  const [selectedKey, setSelectedKey] = useState("millennialExample");

  const values = useMemo(() => {
    const map = new Map<string, { age: number; stage: LifeStage }>();
    for (const s of AGE_SCENARIOS) {
      const output = tool.execute({ birthDate: s.birthDate, referenceDate: REFERENCE_DATE }, { locale: "en-US" });
      map.set(s.key, { age: output.data.decimalAge, stage: getLifeStage(output.data.decimalAge) });
    }
    return map;
  }, []);

  const selected = values.get(selectedKey) ?? { age: 0, stage: "childhood" as LifeStage };
  const classification = tStages(selected.stage);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={selected.age}
        domainMin={MIN_AGE}
        domainMax={MAX_AGE}
        zones={[
          { key: "childhood", from: 0, to: 10, colorClass: "stroke-blue-400 dark:stroke-blue-300" },
          { key: "adolescence", from: 10, to: 20, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "youth", from: 20, to: 40, colorClass: "stroke-blue-600 dark:stroke-blue-500" },
          { key: "middleAge", from: 40, to: 60, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
          { key: "oldAge", from: 60, to: MAX_AGE, colorClass: "stroke-indigo-800 dark:stroke-indigo-300" },
        ]}
        valueLabel={`${Math.round(selected.age)}`}
        caption={classification}
        captionColorClass={STAGE_COLOR[selected.stage]}
        ticks={TICKS}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {AGE_SCENARIOS.map((s) => (
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("ageFact", { age: Math.round(selected.age) })}</p>
    </EncyclopediaLiveWidget>
  );
}
