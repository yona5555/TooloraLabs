"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = -5;
const MAX_LOG = 8;
const TICKS = [-5, 0, 4, 8];

// Real, documented approximate forces (newtons) spanning an ant's weight to
// the Saturn V rocket's total liftoff thrust.
const GAUGE_SOURCES: { key: string; force: number }[] = [
  { key: "ant", force: 0.00002 },
  { key: "appleWeight", force: 1 },
  { key: "humanPush", force: 50 },
  { key: "carEngineThrust", force: 4000 },
  { key: "rocketEngineThrust", force: 7000000 },
  { key: "saturnVThrust", force: 34000000 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  if (value >= 1000) return `${value / 1000}k`;
  return value >= 1 ? String(value) : value.toFixed(5).replace(/0+$/, "").replace(/\.$/, "");
}

export default function ForceMagnitudeGauge() {
  const t = useTranslations("tools.force-calculator.education.intro.forceGauge");
  const tSources = useTranslations("tools.force-calculator.education.intro.forceGauge.sources");
  const [selectedKey, setSelectedKey] = useState("carEngineThrust");

  const selected = GAUGE_SOURCES.find((s) => s.key === selectedKey) ?? GAUGE_SOURCES[0];
  const force = selected.force;
  const classification: "light" | "moderate" | "heavy" = force < 10 ? "light" : force < 10000 ? "moderate" : "heavy";
  const digitStyle = resolveDigitStyle(String(force));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 5 });

  const gaugeValue = Math.log10(force);
  const acceleration = force / 1;

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
          { key: "light", from: MIN_LOG, to: 1, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "moderate", from: 1, to: 4, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "heavy", from: 4, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(force)} N`}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("accelerationFact", { acceleration: fmt(acceleration) })}</p>
    </EncyclopediaLiveWidget>
  );
}
