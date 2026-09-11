"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "low" | "moderate" | "high";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "low", from: 0, to: 10, colorClass: "stroke-blue-400 dark:stroke-blue-300" },
  { key: "moderate", from: 10, to: 25, colorClass: "stroke-blue-600 dark:stroke-blue-500" },
  { key: "high", from: 25, to: 50, colorClass: "stroke-indigo-700 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  low: "fill-blue-400 dark:fill-blue-300",
  moderate: "fill-blue-600 dark:fill-blue-500",
  high: "fill-indigo-700 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 50;
const TICKS = [0, 10, 25, 50];

const EXAMPLES = [
  { key: "salesTax", percent: 7 },
  { key: "restaurantTip", percent: 18 },
  { key: "storeDiscount", percent: 30 },
  { key: "creditCardApr", percent: 24 },
];

function zoneForPercent(percent: number): ZoneKey {
  const zone = ZONES.find((z) => percent < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function PercentageRateGauge() {
  const t = useTranslations("tools.percentage-calculator.education.intro.rateGauge");
  const tExamples = useTranslations("tools.percentage-calculator.education.intro.rateGauge.examples");
  const tZones = useTranslations("tools.percentage-calculator.education.intro.rateGauge.zones");
  const [selectedKey, setSelectedKey] = useState("restaurantTip");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[1], [selectedKey]);
  const zone = zoneForPercent(selected.percent);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected.percent}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${selected.percent}%`}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === example.key}
            onClick={() => setSelectedKey(example.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === example.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tExamples(example.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tExamples(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { percent: `${selected.percent}%` })}</p>
    </EncyclopediaLiveWidget>
  );
}
