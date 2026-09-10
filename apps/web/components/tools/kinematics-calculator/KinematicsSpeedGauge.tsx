"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = -3;
const MAX_LOG = 3;
const TICKS = [-3, -1, 1, 3];
const REFERENCE_SECONDS = 10;

// Real, documented approximate speeds (m/s) spanning a garden snail to the
// speed of sound in air.
const GAUGE_MOVERS: { key: string; speed: number }[] = [
  { key: "snail", speed: 0.001 },
  { key: "walkingHuman", speed: 1.4 },
  { key: "runningHuman", speed: 8 },
  { key: "carHighway", speed: 30 },
  { key: "commercialJet", speed: 250 },
  { key: "speedOfSound", speed: 343 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1 ? String(Math.round(value)) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default function KinematicsSpeedGauge() {
  const t = useTranslations("tools.kinematics-calculator.education.intro.speedGauge");
  const tMovers = useTranslations("tools.kinematics-calculator.education.intro.speedGauge.movers");
  const [selectedKey, setSelectedKey] = useState("carHighway");

  const selected = GAUGE_MOVERS.find((m) => m.key === selectedKey) ?? GAUGE_MOVERS[0];
  const speed = selected.speed;
  const classification: "slow" | "moderate" | "fast" = speed < 3 ? "slow" : speed < 50 ? "moderate" : "fast";
  const digitStyle = resolveDigitStyle(String(speed));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  const gaugeValue = Math.log10(speed);
  const distance = speed * REFERENCE_SECONDS;

  const classificationColor =
    classification === "slow" ? "fill-blue-600 dark:fill-blue-400" : classification === "moderate" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "slow", from: MIN_LOG, to: 0.5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "moderate", from: 0.5, to: 1.7, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "fast", from: 1.7, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(speed)} m/s`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_MOVERS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === m.key}
            onClick={() => setSelectedKey(m.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === m.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tMovers(m.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { mover: tMovers(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("distanceFact", { distance: fmt(distance) })}</p>
    </EncyclopediaLiveWidget>
  );
}
