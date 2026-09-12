"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "quick" | "moderate" | "long";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "quick", from: 1, to: 1.5, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "moderate", from: 1.5, to: 2.5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "long", from: 2.5, to: 3.2, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  quick: "fill-green-500 dark:fill-green-400",
  moderate: "fill-blue-500 dark:fill-blue-400",
  long: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 1;
const DOMAIN_MAX = 3.2;
const TICKS = [1, 2, 3];

const EXAMPLES = [
  { key: "coffeeBreak", minutes: 15 },
  { key: "movie", minutes: 120 },
  { key: "marathonRun", minutes: 240 },
  { key: "workday", minutes: 480 },
  { key: "fullDay", minutes: 1440 },
];

function zoneForLogMinutes(log: number): ZoneKey {
  const zone = ZONES.find((z) => log < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

function tickLabel(tick: number): string {
  return `${Math.round(10 ** tick)}m`;
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) return `${Math.round((minutes / 60) * 10) / 10}h`;
  return `${minutes}m`;
}

export default function TimeDurationScaleGauge() {
  const t = useTranslations("tools.time-calculator.education.intro.durationGauge");
  const tExamples = useTranslations("tools.time-calculator.education.intro.durationGauge.examples");
  const tZones = useTranslations("tools.time-calculator.education.intro.durationGauge.zones");
  const [selectedKey, setSelectedKey] = useState("movie");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[1], [selectedKey]);
  const logMinutes = Math.log10(selected.minutes);
  const zone = zoneForLogMinutes(logMinutes);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={logMinutes}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={formatMinutes(selected.minutes)}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { duration: formatMinutes(selected.minutes) })}</p>
    </EncyclopediaLiveWidget>
  );
}
