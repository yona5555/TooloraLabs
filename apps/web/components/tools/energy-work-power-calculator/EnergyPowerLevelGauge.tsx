"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = 0;
const MAX_LOG = 6;
const TICKS = [0, 2, 4, 6];
const REFERENCE_HOURS = 1;

// Real, documented approximate power draws (watts).
const GAUGE_DEVICES: { key: string; power: number }[] = [
  { key: "ledBulb", power: 10 },
  { key: "humanResting", power: 100 },
  { key: "laptop", power: 65 },
  { key: "microwave", power: 1000 },
  { key: "hairDryer", power: 1500 },
  { key: "carEngine", power: 100000 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1000 ? `${value / 1000}k` : String(value);
}

export default function EnergyPowerLevelGauge() {
  const t = useTranslations("tools.energy-work-power-calculator.education.intro.powerLevelGauge");
  const tDevices = useTranslations("tools.energy-work-power-calculator.education.intro.powerLevelGauge.devices");
  const [selectedKey, setSelectedKey] = useState("laptop");

  const selected = GAUGE_DEVICES.find((d) => d.key === selectedKey) ?? GAUGE_DEVICES[0];
  const power = selected.power;
  const classification: "low" | "everyday" | "high" = power < 100 ? "low" : power < 2000 ? "everyday" : "high";
  const digitStyle = resolveDigitStyle(String(power));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const gaugeValue = Math.log10(power);
  const energyKwh = (power * REFERENCE_HOURS) / 1000;

  const classificationColor =
    classification === "low" ? "fill-blue-600 dark:fill-blue-400" : classification === "everyday" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "low", from: MIN_LOG, to: 2, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "everyday", from: 2, to: 3.3, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "high", from: 3.3, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(power)} W`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_DEVICES.map((d) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === d.key}
            onClick={() => setSelectedKey(d.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === d.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tDevices(d.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { device: tDevices(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("energyFact", { energy: fmt(energyKwh) })}</p>
    </EncyclopediaLiveWidget>
  );
}
