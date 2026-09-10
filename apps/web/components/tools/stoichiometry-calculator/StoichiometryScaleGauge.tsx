"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = 0;
const MAX_LOG = 15;
const TICKS = [0, 5, 10, 15];

// Real reaction scales (grams of material reacted), from a classroom demo
// to global industrial ammonia production.
const GAUGE_SCENARIOS: { key: string; grams: number }[] = [
  { key: "classroomExperiment", grams: 5 },
  { key: "labSynthesis", grams: 50 },
  { key: "pilotPlantBatch", grams: 5000 },
  { key: "industrialBatch", grams: 5000000 },
  { key: "haberPlantDaily", grams: 2000000000 },
  { key: "globalAmmoniaProduction", grams: 150000000000000 },
];

// Abbreviates large magnitudes (k/M/B/T) so both the axis ticks and the
// center readout stay compact — a plain comma-grouped "150,000,000,000,000"
// would overflow the gauge's fixed-width center label.
function abbreviate(value: number): string {
  if (value >= 1e12) return `${Math.round((value / 1e12) * 10) / 10}T`;
  if (value >= 1e9) return `${Math.round((value / 1e9) * 10) / 10}B`;
  if (value >= 1e6) return `${Math.round((value / 1e6) * 10) / 10}M`;
  if (value >= 1e3) return `${Math.round((value / 1e3) * 10) / 10}k`;
  return String(Math.round(value * 100) / 100);
}

function tickLabel(tick: number): string {
  return abbreviate(10 ** tick);
}

export default function StoichiometryScaleGauge() {
  const t = useTranslations("tools.stoichiometry-calculator.education.intro.scaleGauge");
  const tScenarios = useTranslations("tools.stoichiometry-calculator.education.intro.scaleGauge.scenarios");
  const [selectedKey, setSelectedKey] = useState("labSynthesis");

  const selected = GAUGE_SCENARIOS.find((s) => s.key === selectedKey) ?? GAUGE_SCENARIOS[0];
  const grams = selected.grams;
  const classification: "lab" | "pilot" | "industrial" = grams < 1000 ? "lab" : grams < 1000000 ? "pilot" : "industrial";

  const gaugeValue = Math.log10(grams);
  const kg = grams / 1000;

  const classificationColor =
    classification === "lab" ? "fill-blue-600 dark:fill-blue-400" : classification === "pilot" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "lab", from: MIN_LOG, to: 3, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "pilot", from: 3, to: 6, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "industrial", from: 6, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${abbreviate(grams)} g`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_SCENARIOS.map((s) => (
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

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { scenario: tScenarios(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("kgFact", { kg: abbreviate(kg) })}</p>
    </EncyclopediaLiveWidget>
  );
}
