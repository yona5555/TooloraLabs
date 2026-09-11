"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "elite" | "athletic" | "normal" | "elevated" | "high";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "elite", from: 40, to: 50, colorClass: "stroke-indigo-500 dark:stroke-indigo-400" },
  { key: "athletic", from: 50, to: 60, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "normal", from: 60, to: 90, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "elevated", from: 90, to: 100, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "high", from: 100, to: 120, colorClass: "stroke-red-500 dark:stroke-red-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  elite: "fill-indigo-500 dark:fill-indigo-400",
  athletic: "fill-blue-500 dark:fill-blue-400",
  normal: "fill-green-500 dark:fill-green-400",
  elevated: "fill-amber-500 dark:fill-amber-400",
  high: "fill-red-500 dark:fill-red-400",
};

const DOMAIN_MIN = 40;
const DOMAIN_MAX = 120;
const TICKS = [40, 50, 60, 90, 100, 120];

function zoneForBpm(bpm: number): ZoneKey {
  const zone = ZONES.find((z) => bpm < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

const EXAMPLES = [
  { key: "eliteAthlete", bpm: 45 },
  { key: "recreationalAthlete", bpm: 55 },
  { key: "averageAdult", bpm: 72 },
  { key: "deskWorker", bpm: 88 },
  { key: "stressedElevated", bpm: 105 },
];

export default function TargetHeartRateRestingGauge() {
  const t = useTranslations("tools.target-heart-rate-calculator.education.intro.restingGauge");
  const tExamples = useTranslations("tools.target-heart-rate-calculator.education.intro.restingGauge.examples");
  const tClassifications = useTranslations("tools.target-heart-rate-calculator.education.intro.restingGauge.classifications");
  const [selectedKey, setSelectedKey] = useState("averageAdult");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[2], [selectedKey]);
  const zone = zoneForBpm(selected.bpm);
  const classification = tClassifications(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected.bpm}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${selected.bpm}`}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { bpm: `${selected.bpm}` })}</p>
    </EncyclopediaLiveWidget>
  );
}
