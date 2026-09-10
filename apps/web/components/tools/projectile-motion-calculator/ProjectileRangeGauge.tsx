"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const MIN_LOG = 1;
const MAX_LOG = 7;
const TICKS = [1, 3, 5, 7];
const FIELD_LENGTH = 100;

// Real, documented approximate ranges (meters) spanning a paper airplane to
// an intercontinental ballistic missile.
const GAUGE_PROJECTILES: { key: string; range: number }[] = [
  { key: "paperAirplane", range: 10 },
  { key: "baseballThrow", range: 100 },
  { key: "golfDrive", range: 250 },
  { key: "cannonball", range: 1000 },
  { key: "artilleryShell", range: 30000 },
  { key: "icbm", range: 10000000 },
];

function tickLabel(tick: number): string {
  const value = 10 ** tick;
  if (value >= 1000) return `${value / 1000}k`;
  return String(value);
}

export default function ProjectileRangeGauge() {
  const t = useTranslations("tools.projectile-motion-calculator.education.intro.rangeGauge");
  const tProjectiles = useTranslations("tools.projectile-motion-calculator.education.intro.rangeGauge.projectiles");
  const [selectedKey, setSelectedKey] = useState("golfDrive");

  const selected = GAUGE_PROJECTILES.find((p) => p.key === selectedKey) ?? GAUGE_PROJECTILES[0];
  const range = selected.range;
  const classification: "short" | "medium" | "long" = range < 1000 ? "short" : range < 100000 ? "medium" : "long";
  const digitStyle = resolveDigitStyle(String(range));
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const gaugeValue = Math.log10(range);
  const ratio = range / FIELD_LENGTH;

  const classificationColor =
    classification === "short" ? "fill-blue-600 dark:fill-blue-400" : classification === "medium" ? "fill-green-600 dark:fill-green-400" : "fill-amber-600 dark:fill-amber-400";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <RatioGauge
        value={gaugeValue}
        domainMin={MIN_LOG}
        domainMax={MAX_LOG}
        zones={[
          { key: "short", from: MIN_LOG, to: 3, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
          { key: "medium", from: 3, to: 5, colorClass: "stroke-green-500 dark:stroke-green-400" },
          { key: "long", from: 5, to: MAX_LOG, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
        ]}
        valueLabel={`${fmt(range)} m`}
        caption={t(classification)}
        captionColorClass={classificationColor}
        ticks={TICKS}
        tickFormatter={tickLabel}
      />

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GAUGE_PROJECTILES.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === p.key}
            onClick={() => setSelectedKey(p.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === p.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tProjectiles(p.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { projectile: tProjectiles(selectedKey), classification: t(classification) })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fieldsFact", { ratio: fmt(ratio) })}</p>
    </EncyclopediaLiveWidget>
  );
}
