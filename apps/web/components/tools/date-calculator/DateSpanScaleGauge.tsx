"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "short" | "medium" | "long";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "short", from: 0, to: 1.5, colorClass: "stroke-blue-400 dark:stroke-blue-300" },
  { key: "medium", from: 1.5, to: 3, colorClass: "stroke-blue-600 dark:stroke-blue-500" },
  { key: "long", from: 3, to: 4, colorClass: "stroke-indigo-700 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  short: "fill-blue-400 dark:fill-blue-300",
  medium: "fill-blue-600 dark:fill-blue-500",
  long: "fill-indigo-700 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 4;
const TICKS = [0, 1, 2, 3, 4];

const EXAMPLES = [
  { key: "longWeekend", days: 3 },
  { key: "schoolYear", days: 180 },
  { key: "pregnancyTerm", days: 280 },
  { key: "presidentialTerm", days: 1460 },
  { key: "decade", days: 3650 },
];

function zoneForLogDays(log: number): ZoneKey {
  const zone = ZONES.find((z) => log < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

function tickLabel(tick: number): string {
  return `${Math.round(10 ** tick)}`;
}

export default function DateSpanScaleGauge() {
  const t = useTranslations("tools.date-calculator.education.intro.spanGauge");
  const tExamples = useTranslations("tools.date-calculator.education.intro.spanGauge.examples");
  const tZones = useTranslations("tools.date-calculator.education.intro.spanGauge.zones");
  const [selectedKey, setSelectedKey] = useState("schoolYear");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[1], [selectedKey]);
  const logDays = Math.log10(selected.days);
  const zone = zoneForLogDays(logDays);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={logDays}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={t("daysValue", { days: selected.days })}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
          tickFormatter={tickLabel}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { days: selected.days })}</p>
    </EncyclopediaLiveWidget>
  );
}
