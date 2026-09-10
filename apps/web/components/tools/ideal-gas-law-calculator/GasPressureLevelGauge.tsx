"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = -10;
const MAX_LOG = 3;
const TICKS = [-10, -5, 0, 3];
const ATM_TO_PSI = 14.6959;

// Real, documented approximate pressures (atm) spanning outer space to an
// industrial hydraulic press.
const GAUGE_SOURCES: { key: string; pressure: number }[] = [
  { key: "outerSpace", pressure: 1e-10 },
  { key: "vacuumCleaner", pressure: 0.8 },
  { key: "atmosphere", pressure: 1 },
  { key: "carTire", pressure: 2.2 },
  { key: "scubaTank", pressure: 200 },
  { key: "hydraulicPress", pressure: 1000 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1 ? String(Math.round(value)) : value.toExponential(0);
}

export default function GasPressureLevelGauge() {
  const t = useTranslations("tools.ideal-gas-law-calculator.education.intro.pressureGauge");
  const tSources = useTranslations("tools.ideal-gas-law-calculator.education.intro.pressureGauge.sources");
  const [selectedKey, setSelectedKey] = useState("atmosphere");

  const selected = GAUGE_SOURCES.find((s) => s.key === selectedKey) ?? GAUGE_SOURCES[0];
  const pressure = selected.pressure;
  const classification: "vacuum" | "normal" | "highPressure" = pressure < 0.1 ? "vacuum" : pressure <= 10 ? "normal" : "highPressure";
  const digitStyle = resolveDigitStyle(String(pressure));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const gaugeValue = Math.log10(pressure);
  const psi = pressure * ATM_TO_PSI;

  const classificationColor =
    classification === "vacuum" ? "fill-blue-600 dark:fill-blue-400" : classification === "normal" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "vacuum", from: MIN_LOG, to: -1, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "normal", from: -1, to: 1, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "highPressure", from: 1, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(pressure)} atm`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_SOURCES.map((s) => (
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
            {tSources(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { source: tSources(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("psiFact", { psi: fmt(psi) })}</p>
    </EncyclopediaLiveWidget>
  );
}
