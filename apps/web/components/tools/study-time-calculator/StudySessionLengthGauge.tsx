"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { STUDY_SESSION_SCENARIOS } from "./types";

type ZoneKey = "quick" | "standard" | "extended";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "quick", from: 1.4, to: 1.9, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "standard", from: 1.9, to: 2.5, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "extended", from: 2.5, to: 2.7, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  quick: "fill-green-500 dark:fill-green-400",
  standard: "fill-blue-500 dark:fill-blue-400",
  extended: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 1.4;
const DOMAIN_MAX = 2.7;
const TICKS = [1.5, 2, 2.5];

function zoneForLogMinutes(log: number): ZoneKey {
  const zone = ZONES.find((z) => log < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

function tickLabel(tick: number): string {
  return `${Math.round(10 ** tick)}m`;
}

export default function StudySessionLengthGauge() {
  const t = useTranslations("tools.study-time-calculator.education.intro.sessionGauge");
  const tScenarios = useTranslations("tools.study-time-calculator.scenarios");
  const tZones = useTranslations("tools.study-time-calculator.education.intro.sessionGauge.zones");
  const [selectedKey, setSelectedKey] = useState(STUDY_SESSION_SCENARIOS[1].key);

  const selected = useMemo(
    () => STUDY_SESSION_SCENARIOS.find((s) => s.key === selectedKey) ?? STUDY_SESSION_SCENARIOS[1],
    [selectedKey]
  );
  const totalMinutes = Number(selected.totalMinutes);
  const logMinutes = Math.log10(totalMinutes);
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
          valueLabel={t("minutesValue", { minutes: totalMinutes })}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
          tickFormatter={tickLabel}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {STUDY_SESSION_SCENARIOS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === s.key}
            onClick={() => setSelectedKey(s.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === s.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tScenarios(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tScenarios(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { minutes: totalMinutes })}</p>
    </EncyclopediaLiveWidget>
  );
}
