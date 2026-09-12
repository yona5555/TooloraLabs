"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "rare" | "unlikely" | "even" | "likely" | "certain";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "rare", from: 0, to: 10, colorClass: "stroke-red-500 dark:stroke-red-400" },
  { key: "unlikely", from: 10, to: 40, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "even", from: 40, to: 60, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "likely", from: 60, to: 90, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "certain", from: 90, to: 100, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  rare: "fill-red-500 dark:fill-red-400",
  unlikely: "fill-amber-500 dark:fill-amber-400",
  even: "fill-green-500 dark:fill-green-400",
  likely: "fill-blue-500 dark:fill-blue-400",
  certain: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 100;
const TICKS = [0, 10, 40, 60, 90, 100];

const EXAMPLES = [
  { key: "winningRaffle", percent: 2 },
  { key: "rollingSix", percent: 16.7 },
  { key: "coinFlip", percent: 50 },
  { key: "rainTomorrow", percent: 70 },
  { key: "sunriseTomorrow", percent: 99.9 },
];

function zoneForPercent(percent: number): ZoneKey {
  const zone = ZONES.find((z) => percent < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function ProbabilityLikelihoodGauge() {
  const t = useTranslations("tools.probability-calculator.education.intro.likelihoodGauge");
  const tExamples = useTranslations("tools.probability-calculator.education.intro.likelihoodGauge.examples");
  const tZones = useTranslations("tools.probability-calculator.education.intro.likelihoodGauge.zones");
  const [selectedKey, setSelectedKey] = useState("coinFlip");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[2], [selectedKey]);
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
