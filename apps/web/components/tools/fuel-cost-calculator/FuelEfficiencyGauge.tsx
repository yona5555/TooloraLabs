"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "efficient" | "average" | "thirsty";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "efficient", from: 0, to: 6, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "average", from: 6, to: 10, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "thirsty", from: 10, to: 20, colorClass: "stroke-red-500 dark:stroke-red-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  efficient: "fill-green-500 dark:fill-green-400",
  average: "fill-amber-500 dark:fill-amber-400",
  thirsty: "fill-red-500 dark:fill-red-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 20;
const TICKS = [0, 6, 10, 20];

const EXAMPLES = [
  { key: "hybridCar", litersPer100km: 5 },
  { key: "compactSedan", litersPer100km: 7 },
  { key: "suv", litersPer100km: 11 },
  { key: "pickupTruck", litersPer100km: 15 },
];

function zoneForRate(rate: number): ZoneKey {
  const zone = ZONES.find((z) => rate < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function FuelEfficiencyGauge() {
  const t = useTranslations("tools.fuel-cost-calculator.education.intro.efficiencyGauge");
  const tExamples = useTranslations("tools.fuel-cost-calculator.education.intro.efficiencyGauge.examples");
  const tZones = useTranslations("tools.fuel-cost-calculator.education.intro.efficiencyGauge.zones");
  const [selectedKey, setSelectedKey] = useState("compactSedan");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[1], [selectedKey]);
  const zone = zoneForRate(selected.litersPer100km);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected.litersPer100km}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${selected.litersPer100km} L/100km`}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { rate: `${selected.litersPer100km} L/100km` })}</p>
    </EncyclopediaLiveWidget>
  );
}
