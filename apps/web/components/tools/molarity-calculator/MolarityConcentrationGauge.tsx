"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = -3;
const MAX_LOG = 1.5;
const TICKS = [-3, -1, 0, 1.5];
const AVOGADRO_SCALED = 6.022; // 6.022 x 10^23 particles per mole

// Real, documented approximate solution concentrations (mol/L) spanning
// blood glucose to concentrated sulfuric acid.
const GAUGE_SUBSTANCES: { key: string; molarity: number }[] = [
  { key: "bloodGlucose", molarity: 0.005 },
  { key: "stomachAcid", molarity: 0.1 },
  { key: "seawater", molarity: 0.6 },
  { key: "vinegar", molarity: 0.83 },
  { key: "labNaOH", molarity: 6 },
  { key: "concentratedH2SO4", molarity: 18.4 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1 ? String(Math.round(value * 10) / 10) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default function MolarityConcentrationGauge() {
  const t = useTranslations("tools.molarity-calculator.education.intro.concentrationGauge");
  const tSubstances = useTranslations("tools.molarity-calculator.education.intro.concentrationGauge.substances");
  const [selectedKey, setSelectedKey] = useState("vinegar");

  const selected = GAUGE_SUBSTANCES.find((s) => s.key === selectedKey) ?? GAUGE_SUBSTANCES[0];
  const molarity = selected.molarity;
  const classification: "dilute" | "moderate" | "concentrated" = molarity < 0.01 ? "dilute" : molarity < 1 ? "moderate" : "concentrated";
  const digitStyle = resolveDigitStyle(String(molarity));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  const gaugeValue = Math.log10(molarity);
  const particles = molarity * AVOGADRO_SCALED;

  const classificationColor =
    classification === "dilute" ? "fill-blue-600 dark:fill-blue-400" : classification === "moderate" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "dilute", from: MIN_LOG, to: -2, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "moderate", from: -2, to: 0, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "concentrated", from: 0, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(molarity)} mol/L`}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("particlesFact", { particles: fmt(particles) })}</p>
    </EncyclopediaLiveWidget>
  );
}
