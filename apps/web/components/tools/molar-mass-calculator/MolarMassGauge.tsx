"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = 0;
const MAX_LOG = 5;
const TICKS = [0, 2, 4, 5];
const WATER_MOLAR_MASS = 18.015;

// Real, documented molar masses (g/mol) spanning hydrogen gas to hemoglobin.
const GAUGE_SUBSTANCES: { key: string; mass: number }[] = [
  { key: "hydrogen", mass: 2.016 },
  { key: "water", mass: 18.015 },
  { key: "tableSalt", mass: 58.44 },
  { key: "glucose", mass: 180.16 },
  { key: "insulin", mass: 5808 },
  { key: "hemoglobin", mass: 64500 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(Math.round(value));
}

export default function MolarMassGauge() {
  const t = useTranslations("tools.molar-mass-calculator.education.intro.massGauge");
  const tSubstances = useTranslations("tools.molar-mass-calculator.education.intro.massGauge.substances");
  const [selectedKey, setSelectedKey] = useState("glucose");

  const selected = GAUGE_SUBSTANCES.find((s) => s.key === selectedKey) ?? GAUGE_SUBSTANCES[0];
  const mass = selected.mass;
  const classification: "light" | "moderate" | "heavy" = mass < 100 ? "light" : mass < 10000 ? "moderate" : "heavy";
  const digitStyle = resolveDigitStyle(String(mass));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const gaugeValue = Math.log10(mass);
  const ratio = mass / WATER_MOLAR_MASS;

  const classificationColor =
    classification === "light" ? "fill-blue-600 dark:fill-blue-400" : classification === "moderate" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "light", from: MIN_LOG, to: 2, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "moderate", from: 2, to: 4, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "heavy", from: 4, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(mass)} g/mol`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_SUBSTANCES.map((s) => (
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
            {tSubstances(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { substance: tSubstances(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("waterRatioFact", { ratio: fmt(ratio) })}</p>
    </EncyclopediaLiveWidget>
  );
}
