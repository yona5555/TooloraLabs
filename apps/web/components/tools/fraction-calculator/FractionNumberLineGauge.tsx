"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "small" | "half" | "large";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "small", from: 0, to: 0.5, colorClass: "stroke-blue-400 dark:stroke-blue-300" },
  { key: "half", from: 0.5, to: 1, colorClass: "stroke-blue-600 dark:stroke-blue-500" },
  { key: "large", from: 1, to: 2, colorClass: "stroke-indigo-700 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  small: "fill-blue-400 dark:fill-blue-300",
  half: "fill-blue-600 dark:fill-blue-500",
  large: "fill-indigo-700 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 2;
const TICKS = [0, 0.5, 1, 1.5, 2];

const EXAMPLES = [
  { key: "quarterTank", numerator: 1, denominator: 4 },
  { key: "halfRecipe", numerator: 1, denominator: 2 },
  { key: "threeQuarterBattery", numerator: 3, denominator: 4 },
  { key: "wholePizza", numerator: 1, denominator: 1 },
  { key: "oneAndHalfCups", numerator: 3, denominator: 2 },
];

function zoneForValue(value: number): ZoneKey {
  const zone = ZONES.find((z) => value < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function FractionNumberLineGauge() {
  const t = useTranslations("tools.fraction-calculator.education.intro.numberLineGauge");
  const tExamples = useTranslations("tools.fraction-calculator.education.intro.numberLineGauge.examples");
  const tZones = useTranslations("tools.fraction-calculator.education.intro.numberLineGauge.zones");
  const [selectedKey, setSelectedKey] = useState("halfRecipe");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[1], [selectedKey]);
  const value = selected.numerator / selected.denominator;
  const zone = zoneForValue(value);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={value}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${selected.numerator}/${selected.denominator}`}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { value: value.toFixed(2) })}</p>
    </EncyclopediaLiveWidget>
  );
}
