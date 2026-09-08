"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = -2;
const MAX_LOG = 12;
const TICKS = [-2, 0, 5, 12];
const REFERENCE_VOLTAGE = 12;

// Real, documented approximate resistances (ohms) spanning conductors to
// insulators — a copper wire is roughly 14 orders of magnitude less
// resistive than glass.
const GAUGE_MATERIALS: { key: string; resistance: number }[] = [
  { key: "copperWire", resistance: 0.02 },
  { key: "led", resistance: 10 },
  { key: "incandescentBulb", resistance: 240 },
  { key: "humanBody", resistance: 100000 },
  { key: "wood", resistance: 1e10 },
  { key: "glass", resistance: 1e12 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  return value >= 1000 ? `10^${tick}` : String(value);
}

export default function OhmsLawConductivityGauge() {
  const t = useTranslations("tools.ohms-law-calculator.education.intro.conductivityGauge");
  const tMaterials = useTranslations("tools.ohms-law-calculator.education.intro.conductivityGauge.materials");
  const [selectedKey, setSelectedKey] = useState("copperWire");

  const selected = GAUGE_MATERIALS.find((m) => m.key === selectedKey) ?? GAUGE_MATERIALS[0];
  const resistance = selected.resistance;
  const classification: "conductor" | "moderate" | "insulator" = resistance < 1 ? "conductor" : resistance < 100000 ? "moderate" : "insulator";
  const digitStyle = resolveDigitStyle(String(resistance));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 3 });

  const gaugeValue = Math.log10(resistance);
  const current = REFERENCE_VOLTAGE / resistance;

  const classificationColor =
    classification === "conductor" ? "fill-blue-600 dark:fill-blue-400" : classification === "moderate" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "conductor", from: MIN_LOG, to: 0, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "moderate", from: 0, to: 5, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "insulator", from: 5, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(resistance)} Ω`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_MATERIALS.map((m) => (
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
            {tMaterials(m.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { material: tMaterials(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("currentFact", { current: fmt(current), voltage: REFERENCE_VOLTAGE })}</p>
    </EncyclopediaLiveWidget>
  );
}
