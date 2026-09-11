"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "veryLow" | "low" | "moderate" | "high";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "veryLow", from: 0, to: 10, colorClass: "stroke-purple-500 dark:stroke-purple-400" },
  { key: "low", from: 10, to: 25, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "moderate", from: 25, to: 50, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "high", from: 50, to: 70, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  veryLow: "fill-purple-500 dark:fill-purple-400",
  low: "fill-blue-500 dark:fill-blue-400",
  moderate: "fill-green-500 dark:fill-green-400",
  high: "fill-amber-500 dark:fill-amber-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 70;
const TICKS = [0, 10, 25, 50, 70];

function zoneForCarbPercent(percent: number): ZoneKey {
  const zone = ZONES.find((z) => percent < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

const EXAMPLES = [
  { key: "ketogenicDiet", carbPercent: 5 },
  { key: "lowCarbDiet", carbPercent: 20 },
  { key: "balancedDiet", carbPercent: 45 },
  { key: "enduranceAthleteDiet", carbPercent: 62 },
];

export default function MacroCarbGauge() {
  const t = useTranslations("tools.macro-calculator.education.intro.carbGauge");
  const tExamples = useTranslations("tools.macro-calculator.education.intro.carbGauge.examples");
  const tClassifications = useTranslations("tools.macro-calculator.education.intro.carbGauge.classifications");
  const [selectedKey, setSelectedKey] = useState("balancedDiet");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[2], [selectedKey]);
  const zone = zoneForCarbPercent(selected.carbPercent);
  const classification = tClassifications(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected.carbPercent}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${selected.carbPercent}%`}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { percent: `${selected.carbPercent}%` })}</p>
    </EncyclopediaLiveWidget>
  );
}
